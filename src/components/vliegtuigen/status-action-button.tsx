'use client'

import { useTransition } from 'react'
import { setAircraftStatus } from '@/app/actions/aircraft'

type Props = { id: string; currentStatus: string }

export function StatusActionButton({ id, currentStatus }: Props) {
  const [pending, startTransition] = useTransition()

  const isGrounded = currentStatus === 'onderhoud'

  function handleClick() {
    const next = isGrounded ? 'beschikbaar' : 'onderhoud'
    const msg  = isGrounded
      ? 'Vliegtuig weer beschikbaar stellen?'
      : 'Vliegtuig aan de grond zetten (status → onderhoud)?'
    if (!confirm(msg)) return
    startTransition(() => setAircraftStatus(id, next))
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
        isGrounded
          ? 'border-green-200 bg-green-50 text-green-800 hover:bg-green-100'
          : 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
      }`}
    >
      {pending ? 'Bezig…' : isGrounded ? 'Beschikbaar stellen' : 'Aan de grond'}
    </button>
  )
}
