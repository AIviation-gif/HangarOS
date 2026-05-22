import { createClient } from '@/lib/supabase/server'
import { getProfile, isManager } from '@/lib/auth/get-profile'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeftIcon } from 'lucide-react'
import { DeletePostButton } from '@/components/blog/delete-post-button'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('nl-NL', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
}

export default async function BerichtPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const profile = await getProfile()
  if (!profile) redirect('/login')

  const supabase = await createClient()
  const { data: post } = await supabase
    .from('posts')
    .select(`
      id, title, content, cover_image_url, status, published_at, created_at, author_id,
      author:author_id ( full_name )
    `)
    .eq('id', id)
    .single()

  if (!post) notFound()

  const author   = post.author as unknown as { full_name: string } | null
  const manager  = isManager(profile.role)
  const canEdit  = manager || post.author_id === profile.id
  const date     = post.published_at ?? post.created_at

  const paragraphs = post.content.split(/\n\n+/)

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <Link
          href="/dashboard/blog"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Blog
        </Link>
        {canEdit && (
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/blog/${id}/bewerken`} className="text-sm text-blue-600 hover:underline">
              Bewerken
            </Link>
            <DeletePostButton id={id} />
          </div>
        )}
      </div>

      {post.cover_image_url && (
        <img
          src={post.cover_image_url}
          alt=""
          className="w-full rounded-lg object-cover max-h-64 mb-6 border border-gray-100"
        />
      )}

      {post.status === 'draft' && (
        <span className="inline-flex mb-3 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
          Concept — niet zichtbaar voor andere leden
        </span>
      )}

      <h1 className="text-3xl font-bold text-gray-900 leading-snug">{post.title}</h1>

      <p className="mt-2 text-sm text-gray-400">
        {author?.full_name ?? '—'} · {formatDate(date)}
      </p>

      <div className="mt-6 text-gray-700 leading-relaxed space-y-4">
        {paragraphs.map((para, i) => (
          <p key={i} className="whitespace-pre-wrap">{para}</p>
        ))}
      </div>
    </div>
  )
}
