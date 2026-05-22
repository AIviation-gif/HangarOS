'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

type FlightState =
  | { error: string }
  | { success: true }
  | undefined

function getFlightFields(formData: FormData) {
  return {
    aircraft_id:    formData.get('aircraft_id') as string,
    pilot_id:       formData.get('pilot_id') as string,
    instructor_id:  (formData.get('instructor_id') as string) || null,
    date:           formData.get('date') as string,
    departure_time: formData.get('departure_time') as string,
    arrival_time:   formData.get('arrival_time') as string,
    from_icao:      (formData.get('from_icao') as string).trim().toUpperCase(),
    to_icao:        (formData.get('to_icao') as string).trim().toUpperCase(),
    landings:       parseInt(formData.get('landings') as string) || 1,
    remarks:        (formData.get('remarks') as string).trim() || null,
  }
}

export async function addFlight(state: FlightState, formData: FormData): Promise<FlightState> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('club_id')
    .eq('id', user.id)
    .single()

  if (!profile) return { error: 'Profiel niet gevonden.' }

  const { error } = await supabase.from('flights').insert({
    club_id: profile.club_id,
    ...getFlightFields(formData),
  })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/vluchten')
  redirect('/dashboard/vluchten')
}

export async function updateFlight(state: FlightState, formData: FormData): Promise<FlightState> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const id = formData.get('_id') as string

  const { error } = await supabase.from('flights').update(getFlightFields(formData)).eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/vluchten')
  redirect('/dashboard/vluchten')
}

export async function deleteFlight(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await supabase.from('flights').delete().eq('id', id)

  revalidatePath('/dashboard/vluchten')
}
