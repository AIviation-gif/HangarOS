'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

type DefectState = { error: string } | { success: true } | undefined

function adminStorage() {
  return createAdminClient(
    'https://biijudfrsisyaukcjdaa.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  ).storage
}

async function uploadPhoto(file: File, clubId: string): Promise<string | null> {
  if (!file || file.size === 0) return null
  const ext  = file.name.split('.').pop() ?? 'jpg'
  const path = `${clubId}/${Date.now()}.${ext}`
  const { data, error } = await adminStorage()
    .from('defect-photos')
    .upload(path, file, { contentType: file.type })
  if (error || !data) return null
  return `https://biijudfrsisyaukcjdaa.supabase.co/storage/v1/object/public/defect-photos/${data.path}`
}

export async function addDefect(state: DefectState, formData: FormData): Promise<DefectState> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('club_id')
    .eq('id', user.id)
    .single()
  if (!profile) return { error: 'Profiel niet gevonden.' }

  const photo    = formData.get('photo') as File
  const photoUrl = await uploadPhoto(photo, profile.club_id)

  const { error } = await supabase.from('defects').insert({
    club_id:     profile.club_id,
    aircraft_id: formData.get('aircraft_id') as string,
    reported_by: user.id,
    description: (formData.get('description') as string).trim(),
    severity:    formData.get('severity') as string,
    photo_url:   photoUrl,
  })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/defecten')
  redirect('/dashboard/defecten')
}

export async function updateDefectStatus(id: string, status: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await supabase.from('defects').update({
    status,
    resolved_at: status === 'resolved' ? new Date().toISOString() : null,
  }).eq('id', id)

  revalidatePath('/dashboard/defecten')
  revalidatePath(`/dashboard/defecten/${id}`)
}

export async function deleteDefect(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase.from('defects').select('photo_url').eq('id', id).single()

  if (data?.photo_url) {
    const path = data.photo_url.split('/defect-photos/')[1]
    if (path) await adminStorage().from('defect-photos').remove([path])
  }

  await supabase.from('defects').delete().eq('id', id)
  revalidatePath('/dashboard/defecten')
}
