'use client'

import { useActionState } from 'react'

type PostState = { error: string } | { success: true } | undefined

type Post = {
  id: string
  title: string
  content: string
  cover_image_url: string | null
  status: string
}

type Props = {
  action: (state: PostState, formData: FormData) => Promise<PostState>
  post?: Post
}

export function PostForm({ action, post }: Props) {
  const [state, formAction, pending] = useActionState(action, undefined)

  return (
    <form action={formAction} encType="multipart/form-data" className="space-y-5 max-w-2xl">
      {post && <input type="hidden" name="_id" value={post.id} />}

      {state && 'error' in state && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {state.error}
        </p>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Titel</label>
        <input
          id="title" name="title" type="text" required
          defaultValue={post?.title ?? ''}
          placeholder="Geef je bericht een titel"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">Inhoud</label>
        <textarea
          id="content" name="content" required rows={14}
          defaultValue={post?.content ?? ''}
          placeholder="Schrijf hier je bericht… Gebruik lege regels voor alinea's."
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y leading-relaxed"
        />
        <p className="mt-1 text-xs text-gray-400">Lege regels worden alinea-afbrekingen.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Omslagfoto</label>
        {post?.cover_image_url && (
          <img
            src={post.cover_image_url}
            alt=""
            className="mb-2 h-36 w-full max-w-sm rounded-md object-cover border border-gray-200"
          />
        )}
        <input
          id="cover_image" name="cover_image" type="file" accept="image/*"
          className="block text-sm text-gray-500 file:mr-3 file:rounded file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-blue-700 hover:file:bg-blue-100"
        />
        <p className="mt-1 text-xs text-gray-400">Optioneel · JPG, PNG of WebP · max 5 MB</p>
      </div>

      <div className="flex gap-3 pt-1">
        <button
          type="submit" name="status" value="draft" disabled={pending}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          {pending ? 'Opslaan…' : 'Concept opslaan'}
        </button>
        <button
          type="submit" name="status" value="published" disabled={pending}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {pending ? 'Opslaan…' : 'Publiceren'}
        </button>
      </div>
    </form>
  )
}
