'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { getProfile } from '@/lib/auth/get-profile'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

const SUPABASE_URL = 'https://biijudfrsisyaukcjdaa.supabase.co'

function adminStorage() {
  return createAdminClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  }).storage
}

export type DocumentUploadState = { error: string } | { success: true } | undefined

export async function uploadDocument(
  state: DocumentUploadState,
  formData: FormData
): Promise<DocumentUploadState> {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  const file       = formData.get('file') as File
  const name       = (formData.get('name') as string).trim()
  const category   = formData.get('category') as string
  const aircraftId = (formData.get('aircraft_id') as string) || null
  const memberId   = (formData.get('member_id') as string) || null

  if (!file || file.size === 0) return { error: 'Selecteer een bestand.' }
  if (!name) return { error: 'Geef het document een naam.' }

  const ext  = file.name.split('.').pop() ?? 'bin'
  const path = `${profile.club_id}/${category}/${Date.now()}-${name.replace(/\s+/g, '_')}.${ext}`

  const { data, error: uploadErr } = await adminStorage()
    .from('documents')
    .upload(path, file, { contentType: file.type })

  if (uploadErr || !data) return { error: uploadErr?.message ?? 'Upload mislukt.' }

  const { data: { publicUrl } } = adminStorage()
    .from('documents')
    .getPublicUrl(data.path)

  const supabase = await createClient()
  const { error } = await supabase.from('documents').insert({
    club_id:     profile.club_id,
    name,
    file_url:    publicUrl,
    category,
    aircraft_id: aircraftId || null,
    member_id:   memberId || null,
    uploaded_by: profile.id,
  })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/documenten')
  if (aircraftId) revalidatePath(`/dashboard/vliegtuigen/${aircraftId}`)
  if (memberId)   revalidatePath(`/dashboard/leden/${memberId}/bewerken`)

  return { success: true }
}

export async function deleteDocument(id: string, revalidate: string) {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  const supabase = await createClient()
  const { data: doc } = await supabase
    .from('documents')
    .select('file_url, uploaded_by')
    .eq('id', id)
    .single()

  if (!doc) return

  const path = doc.file_url.split('/documents/')[1]
  if (path) await adminStorage().from('documents').remove([path])

  await supabase.from('documents').delete().eq('id', id)
  revalidatePath(revalidate)
}
