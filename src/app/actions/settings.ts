'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

type SettingsState =
  | { error: string }
  | { success: true }
  | undefined

export async function updateProfile(state: SettingsState, formData: FormData): Promise<SettingsState> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase.from('profiles').update({
    full_name:      (formData.get('full_name') as string).trim(),
    license_number: (formData.get('license_number') as string).trim() || null,
    phone:          (formData.get('phone') as string).trim() || null,
  }).eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/instellingen')
  return { success: true }
}
