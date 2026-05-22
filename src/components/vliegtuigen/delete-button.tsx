'use client'

import { useTransition } from 'react'
import { deleteAircraft } from '@/app/actions/aircraft'

export function DeleteButton({ id, registration }: { id: string; registration: string }) {
  const [pending, startTransition] = useTransition()

  function handleClick() {
    if (!confirm(`Vliegtuig ${registration} verwijderen?`)) return
    startTransition(() => deleteAircraft(id))
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="text-red-600 hover:underline disabled:opacity-50"
    >
      {pending ? 'Bezig…' : 'Verwijderen'}
    </button>
  )
}
