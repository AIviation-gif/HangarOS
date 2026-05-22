import { getProfile } from '@/lib/auth/get-profile'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeftIcon } from 'lucide-react'
import { PostForm } from '@/components/blog/post-form'
import { addPost } from '@/app/actions/posts'

export default async function NieuwBerichtPage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  return (
    <div>
      <Link
        href="/dashboard/blog"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ChevronLeftIcon className="h-4 w-4" />
        Terug
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Nieuw bericht</h1>
      <PostForm action={addPost} />
    </div>
  )
}
