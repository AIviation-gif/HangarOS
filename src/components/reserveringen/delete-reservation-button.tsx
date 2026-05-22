'use client'

import { useTransition } from 'react'
import { deleteReservation } from '@/app/actions/reservations'

export function DeleteReservationButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition()

  function handleClick() {
    if (!confirm('Reservering verwijderen?')) return
    startTransition(() => deleteReservation(id))
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
