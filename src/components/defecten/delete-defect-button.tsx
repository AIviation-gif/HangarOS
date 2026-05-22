'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteDefect } from '@/app/actions/defects'

export function DeleteDefectButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  function handleClick() {
    if (!confirm('Defect verwijderen?')) return
    startTransition(async () => {
      await deleteDefect(id)
      router.push('/dashboard/defecten')
    })
  }

  return (
    <button onClick={handleClick} disabled={pending} className="text-red-600 hover:underline disabled:opacity-50 text-sm">
      {pending ? 'Bezig…' : 'Verwijderen'}
    </button>
  )
}
