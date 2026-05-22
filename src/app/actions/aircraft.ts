'use server'

import { createClient } from '@/lib/supabase/server'
import { getProfile, isManager } from '@/lib/auth/get-profile'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

type AircraftState =
  | { error: string }
  | { success: true }
  | undefined

export async function addAircraft(state: AircraftState, formData: FormData): Promise<AircraftState> {
  const profile = await getProfile()
  if (!profile) redirect('/login')
  if (!isManager(profile.role)) return { error: 'Geen toegang. Alleen admins en instructeurs kunnen vliegtuigen toevoegen.' }

  const supabase = await createClient()

  const { error } = await supabase.from('aircraft').insert({
    club_id:                  profile.club_id,
    registration:             (formData.get('registration') as string).trim().toUpperCase(),
    type:                     (formData.get('type') as string).trim(),
    total_hours:              parseFloat(formData.get('total_hours') as string) || 0,
    status:                   formData.get('status') as string,
    inspection_interval:      parseFloat(formData.get('inspection_interval') as string) || 100,
    hours_at_last_inspection: parseFloat(formData.get('hours_at_last_inspection') as string) || 0,
    hourly_rate:              parseFloat(formData.get('hourly_rate') as string) || 0,
  })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/vliegtuigen')
  redirect('/dashboard/vliegtuigen')
}

export async function updateAircraft(state: AircraftState, formData: FormData): Promise<AircraftState> {
  const profile = await getProfile()
  if (!profile) redirect('/login')
  if (!isManager(profile.role)) return { error: 'Geen toegang. Alleen admins en instructeurs kunnen vliegtuigen bewerken.' }

  const supabase = await createClient()
  const id = formData.get('_id') as string

  const { error } = await supabase.from('aircraft').update({
    registration:             (formData.get('registration') as string).trim().toUpperCase(),
    type:                     (formData.get('type') as string).trim(),
    total_hours:              parseFloat(formData.get('total_hours') as string) || 0,
    status:                   formData.get('status') as string,
    inspection_interval:      parseFloat(formData.get('inspection_interval') as string) || 100,
    hours_at_last_inspection: parseFloat(formData.get('hours_at_last_inspection') as string) || 0,
    hourly_rate:              parseFloat(formData.get('hourly_rate') as string) || 0,
  }).eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/vliegtuigen')
  redirect('/dashboard/vliegtuigen')
}

export async function setAircraftStatus(id: string, status: string) {
  const profile = await getProfile()
  if (!profile) redirect('/login')
  if (!isManager(profile.role)) return

  const supabase = await createClient()
  await supabase.from('aircraft').update({ status }).eq('id', id)
  revalidatePath('/dashboard/vliegtuigen')
  revalidatePath(`/dashboard/vliegtuigen/${id}`)
}

export async function markInspectionDone(id: string) {
  const profile = await getProfile()
  if (!profile) redirect('/login')
  if (!isManager(profile.role)) return

  const supabase = await createClient()

  const { data: aircraft } = await supabase
    .from('aircraft')
    .select('total_hours')
    .eq('id', id)
    .single()

  if (!aircraft) return

  await supabase.from('aircraft').update({
    hours_at_last_inspection: aircraft.total_hours,
  }).eq('id', id)

  revalidatePath('/dashboard/vliegtuigen')
  revalidatePath(`/dashboard/vliegtuigen/${id}`)
}

export async function deleteAircraft(id: string) {
  const profile = await getProfile()
  if (!profile) redirect('/login')
  if (!isManager(profile.role)) return

  const supabase = await createClient()
  await supabase.from('aircraft').delete().eq('id', id)

  revalidatePath('/dashboard/vliegtuigen')
}
