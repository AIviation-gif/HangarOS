'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

type MemberState =
  | { error: string }
  | { success: true }
  | undefined

export async function updateMember(state: MemberState, formData: FormData): Promise<MemberState> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const id = formData.get('_id') as string

  const licenseExpiry = (formData.get('license_expiry') as string).trim() || null
  const medicalExpiry = (formData.get('medical_expiry') as string).trim() || null

  const { error } = await supabase.from('profiles').update({
    full_name:      (formData.get('full_name') as string).trim(),
    role:           formData.get('role') as string,
    license_number: (formData.get('license_number') as string).trim() || null,
    license_expiry: licenseExpiry,
    medical_expiry: medicalExpiry,
    ratings:        (formData.get('ratings') as string).trim() || null,
    phone:          (formData.get('phone') as string).trim() || null,
  }).eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/leden')
  redirect('/dashboard/leden')
}
