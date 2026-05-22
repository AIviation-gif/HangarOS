'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

type AuthState =
  | { error: string; success?: never; email?: never }
  | { success: true; email: string; error?: never }
  | undefined

function toSlug(name: string) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function login(state: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/dashboard')
}

export async function register(state: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient()

  const email     = formData.get('email') as string
  const password  = formData.get('password') as string
  const fullName  = (formData.get('full_name') as string).trim()
  const clubName  = (formData.get('club_name') as string).trim()
  const clubSlug  = toSlug(clubName)

  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) {
    return { error: error.message }
  }

  if (!data.session) {
    // E-mailbevestiging vereist — profiel aanmaken via trigger na bevestiging (zie NOTES)
    return { success: true, email }
  }

  // Direct ingelogd (e-mailbevestiging uitgeschakeld): maak club + profiel aan
  const { error: rpcError } = await supabase.rpc('create_club_and_profile', {
    p_club_name: clubName,
    p_club_slug: clubSlug,
    p_full_name: fullName,
  })

  if (rpcError) {
    return { error: rpcError.message }
  }

  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
