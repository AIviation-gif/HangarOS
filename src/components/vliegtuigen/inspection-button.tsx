'use client'

import { useTransition } from 'react'
import { markInspectionDone } from '@/app/actions/aircraft'

export function InspectionButton({ id, registration }: { id: string; registration: string }) {
  const [pending, startTransition] = useTransition()

  function handleClick() {
    if (!confirm(`Inspectie uitgevoerd op ${registration}? Uren worden bijgewerkt.`)) return
    startTransition(() => markInspectionDone(id))
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="text-amber-600 hover:underline disabled:opacity-50"
    >
      {pending ? 'Bezig…' : 'Inspectie'}
    </button>
  )
}
