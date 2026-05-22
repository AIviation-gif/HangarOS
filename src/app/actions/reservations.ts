'use server'

import { createClient } from '@/lib/supabase/server'
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

export async function addReservation(state: ReservationState, formData: FormData): Promise<ReservationState> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('club_id')
    .eq('id', user.id)
    .single()

  if (!profile) return { error: 'Profiel niet gevonden.' }

  const fields = getFields(formData)
  if (fields.ends_at <= fields.starts_at) {
    return { error: 'Eindtijd moet na de starttijd liggen.' }
  }

  const { error } = await supabase.from('reservations').insert({
    club_id: profile.club_id,
    ...fields,
  })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/reserveringen')
  redirect('/dashboard/reserveringen')
}

export async function updateReservation(state: ReservationState, formData: FormData): Promise<ReservationState> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const id = formData.get('_id') as string
  const fields = getFields(formData)

  if (fields.ends_at <= fields.starts_at) {
    return { error: 'Eindtijd moet na de starttijd liggen.' }
  }

  const { error } = await supabase.from('reservations').update(fields).eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/reserveringen')
  redirect('/dashboard/reserveringen')
}

export async function deleteReservation(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await supabase.from('reservations').delete().eq('id', id)

  revalidatePath('/dashboard/reserveringen')
}
