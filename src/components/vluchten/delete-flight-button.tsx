'use client'

import { useTransition } from 'react'
import { deleteFlight } from '@/app/actions/flights'

export function DeleteFlightButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition()

  function handleClick() {
    if (!confirm('Vlucht verwijderen?')) return
    startTransition(() => deleteFlight(id))
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
