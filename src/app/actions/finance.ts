'use server'

import { createClient } from '@/lib/supabase/server'
import { getProfile, isManager } from '@/lib/auth/get-profile'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function markFlightsPaid(memberProfileId: string) {
  const profile = await getProfile()
  if (!profile) redirect('/login')
  if (!isManager(profile.role)) return

  const supabase = await createClient()
  await supabase
    .from('flights')
    .update({ paid: true })
    .eq('pilot_id', memberProfileId)
    .eq('paid', false)

  revalidatePath('/dashboard/financien')
}

export async function markFlightPaid(flightId: string) {
  const profile = await getProfile()
  if (!profile) redirect('/login')
  if (!isManager(profile.role)) return

  const supabase = await createClient()
  await supabase.from('flights').update({ paid: true }).eq('id', flightId)

  revalidatePath('/dashboard/financien')
}
