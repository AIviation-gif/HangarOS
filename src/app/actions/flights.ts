'use server'

import { createClient } from '@/lib/supabase/server'
import { getProfile, isManager } from '@/lib/auth/get-profile'
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

function calcDurationHours(dep: string, arr: string): number {
  const [dh, dm] = dep.split(':').map(Number)
  const [ah, am] = arr.split(':').map(Number)
  let mins = (ah * 60 + am) - (dh * 60 + dm)
  if (mins < 0) mins += 24 * 60
  return mins / 60
}

async function calcCost(
  supabase: Awaited<ReturnType<typeof createClient>>,
  aircraftId: string,
  depTime: string,
  arrTime: string
): Promise<number | null> {
  const { data } = await supabase
    .from('aircraft')
    .select('hourly_rate')
    .eq('id', aircraftId)
    .single()

  const rate = Number(data?.hourly_rate ?? 0)
  if (!rate) return null

  const hours = calcDurationHours(depTime, arrTime)
  return Math.round(hours * rate * 100) / 100
}

export async function addFlight(state: FlightState, formData: FormData): Promise<FlightState> {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  const supabase = await createClient()
  const fields   = getFlightFields(formData)
  const cost     = await calcCost(supabase, fields.aircraft_id, fields.departure_time, fields.arrival_time)

  const { error } = await supabase.from('flights').insert({
    club_id: profile.club_id,
    cost,
    ...fields,
  })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/vluchten')
  redirect('/dashboard/vluchten')
}

export async function updateFlight(state: FlightState, formData: FormData): Promise<FlightState> {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  const supabase = await createClient()
  const id       = formData.get('_id') as string

  if (!isManager(profile.role)) {
    const { data: flight } = await supabase
      .from('flights')
      .select('pilot_id')
      .eq('id', id)
      .single()

    if (flight?.pilot_id !== profile.id) {
      return { error: 'Geen toegang. Je kunt alleen je eigen vluchten bewerken.' }
    }
  }

  const fields = getFlightFields(formData)
  const cost   = await calcCost(supabase, fields.aircraft_id, fields.departure_time, fields.arrival_time)

  const { error } = await supabase.from('flights').update({ ...fields, cost }).eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/vluchten')
  redirect('/dashboard/vluchten')
}

export async function deleteFlight(id: string) {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  const supabase = await createClient()

  if (!isManager(profile.role)) {
    const { data: flight } = await supabase
      .from('flights')
      .select('pilot_id')
      .eq('id', id)
      .single()

    if (flight?.pilot_id !== profile.id) return
  }

  await supabase.from('flights').delete().eq('id', id)

  revalidatePath('/dashboard/vluchten')
}
