'use client'

import { useActionState } from 'react'

type AircraftState = { error: string } | { success: true } | undefined

type Aircraft = {
  id: string
  registration: string
  type: string
  total_hours: number
  status: string
}

type Props = {
  action: (state: AircraftState, formData: FormData) => Promise<AircraftState>
  aircraft?: Aircraft
}

const statusOptions = [
  { value: 'beschikbaar', label: 'Beschikbaar' },
  { value: 'onderhoud',   label: 'Onderhoud' },
  { value: 'gereserveerd', label: 'Gereserveerd' },
]

export function AircraftForm({ action, aircraft }: Props) {
  const [state, formAction, pending] = useActionState(action, undefined)

  return (
    <form action={formAction} className="space-y-5 max-w-lg">
      {aircraft && <input type="hidden" name="_id" value={aircraft.id} />}

      {state && 'error' in state && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {state.error}
        </p>
      )}

      <div>
        <label htmlFor="registration" className="block text-sm font-medium text-gray-700 mb-1">
          Registratie
        </label>
        <input
          id="registration"
          name="registration"
          type="text"
          required
          defaultValue={aircraft?.registration ?? ''}
          placeholder="PH-ABC"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
          Type
        </label>
        <input
          id="type"
          name="type"
          type="text"
          required
          defaultValue={aircraft?.type ?? ''}
          placeholder="Cessna 172"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="total_hours" className="block text-sm font-medium text-gray-700 mb-1">
          Totale uren
        </label>
        <input
          id="total_hours"
          name="total_hours"
          type="number"
          min="0"
          step="0.1"
          required
          defaultValue={aircraft?.total_hours ?? 0}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={aircraft?.status ?? 'beschikbaar'}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {statusOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {pending ? 'Opslaan…' : 'Opslaan'}
      </button>
    </form>
  )
}
