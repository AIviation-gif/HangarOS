'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

type AircraftState =
  | { error: string }
  | { success: true }
  | undefined

export async function addAircraft(state: AircraftState, formData: FormData): Promise<AircraftState> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('club_id')
    .eq('id', user.id)
    .single()

  if (!profile) return { error: 'Profiel niet gevonden.' }

  const { error } = await supabase.from('aircraft').insert({
    club_id:                  profile.club_id,
    registration:             (formData.get('registration') as string).trim().toUpperCase(),
    type:                     (formData.get('type') as string).trim(),
    total_hours:              parseFloat(formData.get('total_hours') as string) || 0,
    status:                   formData.get('status') as string,
    inspection_interval:      parseFloat(formData.get('inspection_interval') as string) || 100,
    hours_at_last_inspection: parseFloat(formData.get('hours_at_last_inspection') as string) || 0,
  })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/vliegtuigen')
  redirect('/dashboard/vliegtuigen')
}

export async function updateAircraft(state: AircraftState, formData: FormData): Promise<AircraftState> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const id = formData.get('_id') as string

  const { error } = await supabase.from('aircraft').update({
    registration:             (formData.get('registration') as string).trim().toUpperCase(),
    type:                     (formData.get('type') as string).trim(),
    total_hours:              parseFloat(formData.get('total_hours') as string) || 0,
    status:                   formData.get('status') as string,
    inspection_interval:      parseFloat(formData.get('inspection_interval') as string) || 100,
    hours_at_last_inspection: parseFloat(formData.get('hours_at_last_inspection') as string) || 0,
  }).eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/vliegtuigen')
  redirect('/dashboard/vliegtuigen')
}

export async function markInspectionDone(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

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
}

export async function deleteAircraft(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await supabase.from('aircraft').delete().eq('id', id)

  revalidatePath('/dashboard/vliegtuigen')
}
