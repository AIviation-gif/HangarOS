'use server'

import { createClient } from '@/lib/supabase/server'
import { getProfile, isManager } from '@/lib/auth/get-profile'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

type ReservationState =
  | { error: string }
  | { success: true }
  | undefined

function getFields(formData: FormData) {
  return {
    aircraft_id: formData.get('aircraft_id') as string,
    member_id:   formData.get('member_id') as string,
    starts_at:   formData.get('starts_at') as string,
    ends_at:     formData.get('ends_at') as string,
    status:      formData.get('status') as string,
  }
}

async function checkConflicts(
  supabase: Awaited<ReturnType<typeof createClient>>,
  aircraftId: string,
  startsAt: string,
  endsAt: string,
  excludeId?: string
) {
  const { data: aircraft } = await supabase
    .from('aircraft')
    .select('registration, status')
    .eq('id', aircraftId)
    .single()

  if (aircraft?.status === 'onderhoud') {
    return `${aircraft.registration} staat aan de grond en kan niet worden geboekt.`
  }

  let query = supabase
    .from('reservations')
    .select('id')
    .eq('aircraft_id', aircraftId)
    .neq('status', 'geannuleerd')
    .lt('starts_at', endsAt)
    .gt('ends_at', startsAt)

  if (excludeId) query = query.neq('id', excludeId)

  const { data: conflicts } = await query.limit(1)

  if (conflicts && conflicts.length > 0) {
    return `${aircraft?.registration ?? 'Dit vliegtuig'} is al geboekt in dit tijdvak.`
  }

  return null
}

export async function addReservation(state: ReservationState, formData: FormData): Promise<ReservationState> {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  const supabase = await createClient()
  const fields = getFields(formData)

  if (fields.ends_at <= fields.starts_at) {
    return { error: 'Eindtijd moet na de starttijd liggen.' }
  }

  const conflict = await checkConflicts(supabase, fields.aircraft_id, fields.starts_at, fields.ends_at)
  if (conflict) return { error: conflict }

  const { error } = await supabase.from('reservations').insert({
    club_id: profile.club_id,
    ...fields,
  })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/reserveringen')
  redirect('/dashboard/reserveringen')
}

export async function updateReservation(state: ReservationState, formData: FormData): Promise<ReservationState> {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  const supabase = await createClient()
  const id     = formData.get('_id') as string
  const fields = getFields(formData)

  if (!isManager(profile.role)) {
    const { data: reservation } = await supabase
      .from('reservations')
      .select('member_id')
      .eq('id', id)
      .single()

    if (reservation?.member_id !== profile.id) {
      return { error: 'Geen toegang. Je kunt alleen je eigen reserveringen bewerken.' }
    }
  }

  if (fields.ends_at <= fields.starts_at) {
    return { error: 'Eindtijd moet na de starttijd liggen.' }
  }

  const conflict = await checkConflicts(supabase, fields.aircraft_id, fields.starts_at, fields.ends_at, id)
  if (conflict) return { error: conflict }

  const { error } = await supabase.from('reservations').update(fields).eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/reserveringen')
  redirect('/dashboard/reserveringen')
}

export async function deleteReservation(id: string) {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  const supabase = await createClient()

  if (!isManager(profile.role)) {
    const { data: reservation } = await supabase
      .from('reservations')
      .select('member_id')
      .eq('id', id)
      .single()

    if (reservation?.member_id !== profile.id) return
  }

  await supabase.from('reservations').delete().eq('id', id)

  revalidatePath('/dashboard/reserveringen')
}
