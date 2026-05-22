'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { getProfile, isManager } from '@/lib/auth/get-profile'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

type PostState = { error: string } | { success: true } | undefined

function adminStorage() {
  return createAdminClient(
    'https://biijudfrsisyaukcjdaa.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  ).storage
}

async function uploadCover(file: File, clubId: string): Promise<string | null> {
  if (!file || file.size === 0) return null
  const ext  = file.name.split('.').pop() ?? 'jpg'
  const path = `${clubId}/${Date.now()}.${ext}`
  const { data, error } = await adminStorage()
    .from('post-covers')
    .upload(path, file, { contentType: file.type })
  if (error || !data) return null
  return `https://biijudfrsisyaukcjdaa.supabase.co/storage/v1/object/public/post-covers/${data.path}`
}

async function deleteCover(url: string) {
  const path = url.split('/post-covers/')[1]
  if (path) await adminStorage().from('post-covers').remove([path])
}

export async function addPost(state: PostState, formData: FormData): Promise<PostState> {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  const title   = (formData.get('title') as string).trim()
  const content = (formData.get('content') as string).trim()
  const status  = formData.get('status') as string
  const cover   = formData.get('cover_image') as File

  if (!title)   return { error: 'Titel is verplicht.' }
  if (!content) return { error: 'Inhoud is verplicht.' }

  const coverUrl = await uploadCover(cover, profile.club_id)

  const supabase = await createClient()
  const { error } = await supabase.from('posts').insert({
    club_id:         profile.club_id,
    author_id:       profile.id,
    title,
    content,
    cover_image_url: coverUrl,
    status,
    published_at:    status === 'published' ? new Date().toISOString() : null,
  })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/blog')
  redirect('/dashboard/blog')
}

export async function updatePost(state: PostState, formData: FormData): Promise<PostState> {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  const supabase = await createClient()
  const id = formData.get('_id') as string

  const { data: existing } = await supabase
    .from('posts')
    .select('author_id, cover_image_url, published_at')
    .eq('id', id)
    .single()

  if (!existing) return { error: 'Bericht niet gevonden.' }

  if (!isManager(profile.role) && existing.author_id !== profile.id) {
    return { error: 'Geen toegang. Je kunt alleen je eigen berichten bewerken.' }
  }

  const title   = (formData.get('title') as string).trim()
  const content = (formData.get('content') as string).trim()
  const status  = formData.get('status') as string
  const cover   = formData.get('cover_image') as File

  if (!title)   return { error: 'Titel is verplicht.' }
  if (!content) return { error: 'Inhoud is verplicht.' }

  let coverUrl = existing.cover_image_url
  if (cover && cover.size > 0) {
    if (coverUrl) await deleteCover(coverUrl)
    coverUrl = await uploadCover(cover, profile.club_id)
  }

  const { error } = await supabase.from('posts').update({
    title,
    content,
    cover_image_url: coverUrl,
    status,
    published_at: status === 'published'
      ? (existing.published_at ?? new Date().toISOString())
      : null,
    updated_at: new Date().toISOString(),
  }).eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/blog')
  revalidatePath(`/dashboard/blog/${id}`)
  redirect('/dashboard/blog')
}

export async function deletePost(id: string) {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  const supabase = await createClient()

  const { data: post } = await supabase
    .from('posts')
    .select('author_id, cover_image_url')
    .eq('id', id)
    .single()

  if (!post) return
  if (!isManager(profile.role) && post.author_id !== profile.id) return

  if (post.cover_image_url) await deleteCover(post.cover_image_url)

  await supabase.from('posts').delete().eq('id', id)
  revalidatePath('/dashboard/blog')
}
