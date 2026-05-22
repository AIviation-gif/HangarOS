import { createClient } from '@/lib/supabase/server'
import { getProfile, isManager } from '@/lib/auth/get-profile'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeftIcon } from 'lucide-react'
import { PostForm } from '@/components/blog/post-form'
import { updatePost } from '@/app/actions/posts'

export default async function BerichtBewerkenPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const profile = await getProfile()
  if (!profile) redirect('/login')

  const supabase = await createClient()
  const { data: post } = await supabase
    .from('posts')
    .select('id, title, content, cover_image_url, status, author_id')
    .eq('id', id)
    .single()

  if (!post) notFound()

  if (!isManager(profile.role) && post.author_id !== profile.id) {
    redirect('/dashboard/blog')
  }

  return (
    <div>
      <Link
        href={`/dashboard/blog/${id}`}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ChevronLeftIcon className="h-4 w-4" />
        Terug
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Bericht bewerken</h1>
      <PostForm action={updatePost} post={post} />
    </div>
  )
}
