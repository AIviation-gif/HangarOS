import { createClient } from '@/lib/supabase/server'

export type Profile = {
  id: string
  club_id: string
  role: string
  full_name: string
}

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('profiles')
    .select('id, club_id, role, full_name')
    .eq('id', user.id)
    .single()

  return data
}

export function isManager(role: string) {
  return role === 'admin' || role === 'instructeur'
}
