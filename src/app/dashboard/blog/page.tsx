import { createClient } from '@/lib/supabase/server'
import { getProfile, isManager } from '@/lib/auth/get-profile'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PlusIcon } from 'lucide-react'
import { DeletePostButton } from '@/components/blog/delete-post-button'

const statusBadge: Record<string, string> = {
  published: 'bg-green-100 text-green-800',
  draft:     'bg-gray-100 text-gray-600',
}
const statusLabel: Record<string, string> = {
  published: 'Gepubliceerd',
  draft:     'Concept',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('nl-NL', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
}

export default async function BlogPage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  const manager = isManager(profile.role)

  const supabase = await createClient()
  const { data: posts } = await supabase
    .from('posts')
    .select(`
      id, title, cover_image_url, status, published_at, created_at, author_id,
      author:author_id ( full_name )
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Blog</h1>
        <Link
          href="/dashboard/blog/nieuw"
          className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4" />
          Nieuw bericht
        </Link>
      </div>

      {!posts || posts.length === 0 ? (
        <p className="text-gray-500 text-sm">Nog geen berichten geplaatst.</p>
      ) : (
        <div className="space-y-3">
          {posts.map((p) => {
            const author = p.author as unknown as { full_name: string } | null
            const canEdit = manager || p.author_id === profile.id
            const date = p.published_at ?? p.created_at

            return (
              <div key={p.id} className="flex gap-4 rounded-lg border border-gray-200 bg-white p-4 hover:bg-gray-50">
                {p.cover_image_url && (
                  <img
                    src={p.cover_image_url}
                    alt=""
                    className="h-20 w-28 shrink-0 rounded-md object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <Link href={`/dashboard/blog/${p.id}`} className="hover:underline">
                      <h2 className="font-semibold text-gray-900 leading-snug">{p.title}</h2>
                    </Link>
                    <span className={`shrink-0 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge[p.status] ?? 'bg-gray-100'}`}>
                      {statusLabel[p.status] ?? p.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {author?.full_name ?? '—'} · {formatDate(date)}
                  </p>
                </div>
                {canEdit && (
                  <div className="flex items-center gap-3 shrink-0">
                    <Link href={`/dashboard/blog/${p.id}/bewerken`} className="text-sm text-blue-600 hover:underline">
                      Bewerken
                    </Link>
                    <DeletePostButton id={p.id} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
