'use client'

import { deletePost } from '@/app/actions/posts'

export function DeletePostButton({ id }: { id: string }) {
  async function handleClick() {
    if (!confirm('Bericht verwijderen? Dit kan niet ongedaan worden gemaakt.')) return
    await deletePost(id)
  }

  return (
    <button
      onClick={handleClick}
      className="text-red-500 hover:underline text-sm"
    >
      Verwijderen
    </button>
  )
}
