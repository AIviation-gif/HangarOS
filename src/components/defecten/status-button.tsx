'use client'

import { useTransition } from 'react'
import { updateDefectStatus } from '@/app/actions/defects'

type Props = {
  id: string
  currentStatus: string
}

const transitions: Record<string, { label: string; next: string; className: string }> = {
  open:        { label: 'In behandeling nemen', next: 'in_progress', className: 'bg-yellow-50 text-yellow-800 border-yellow-200 hover:bg-yellow-100' },
  in_progress: { label: 'Markeer als opgelost',  next: 'resolved',    className: 'bg-green-50 text-green-800 border-green-200 hover:bg-green-100' },
}

export function StatusButton({ id, currentStatus }: Props) {
  const [pending, startTransition] = useTransition()
  const t = transitions[currentStatus]
  if (!t) return null

  return (
    <button
      onClick={() => startTransition(() => updateDefectStatus(id, t.next))}
      disabled={pending}
      className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${t.className}`}
    >
      {pending ? 'Bezig…' : t.label}
    </button>
  )
}
