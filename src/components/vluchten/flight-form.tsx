'use client'

import { useActionState } from 'react'

type FlightState = { error: string } | { success: true } | undefined

type Aircraft = { id: string; registration: string; type: string }
type Profile  = { id: string; full_name: string }

type Flight = {
  id: string
  aircraft_id: string
  pilot_id: string
  instructor_id: string | null
  date: string
  departure_time: string
  arrival_time: string
  from_icao: string
  to_icao: string
  landings: number
  remarks: string | null
}

type Props = {
  action: (state: FlightState, formData: FormData) => Promise<FlightState>
  aircraft: Aircraft[]
  members: Profile[]
  flight?: Flight
}

export function FlightForm({ action, aircraft, members, flight }: Props) {
  const [state, formAction, pending] = useActionState(action, undefined)

  return (
    <form action={formAction} className="space-y-5 max-w-lg">
      {flight && <input type="hidden" name="_id" value={flight.id} />}

      {state && 'error' in state && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {state.error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Datum</label>
          <input
            id="date" name="date" type="date" required
            defaultValue={flight?.date ?? new Date().toISOString().slice(0, 10)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="landings" className="block text-sm font-medium text-gray-700 mb-1">Landingen</label>
          <input
            id="landings" name="landings" type="number" min="1" required
            defaultValue={flight?.landings ?? 1}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="aircraft_id" className="block text-sm font-medium text-gray-700 mb-1">Vliegtuig</label>
        <select
          id="aircraft_id" name="aircraft_id" required
          defaultValue={flight?.aircraft_id ?? ''}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="" disabled>Selecteer vliegtuig</option>
          {aircraft.map((a) => (
            <option key={a.id} value={a.id}>{a.registration} — {a.type}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="pilot_id" className="block text-sm font-medium text-gray-700 mb-1">Gezagvoerder</label>
        <select
          id="pilot_id" name="pilot_id" required
          defaultValue={flight?.pilot_id ?? ''}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="" disabled>Selecteer piloot</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>{m.full_name}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="instructor_id" className="block text-sm font-medium text-gray-700 mb-1">
          Instructeur <span className="text-gray-400 font-normal">(optioneel)</span>
        </label>
        <select
          id="instructor_id" name="instructor_id"
          defaultValue={flight?.instructor_id ?? ''}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Geen (solovlucht)</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>{m.full_name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="from_icao" className="block text-sm font-medium text-gray-700 mb-1">Van (ICAO)</label>
          <input
            id="from_icao" name="from_icao" type="text" required maxLength={4}
            defaultValue={flight?.from_icao ?? ''}
            placeholder="EHRD"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="to_icao" className="block text-sm font-medium text-gray-700 mb-1">Naar (ICAO)</label>
          <input
            id="to_icao" name="to_icao" type="text" required maxLength={4}
            defaultValue={flight?.to_icao ?? ''}
            placeholder="EHAM"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="departure_time" className="block text-sm font-medium text-gray-700 mb-1">Vertrek</label>
          <input
            id="departure_time" name="departure_time" type="time" required
            defaultValue={flight?.departure_time?.slice(0, 5) ?? ''}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="arrival_time" className="block text-sm font-medium text-gray-700 mb-1">Aankomst</label>
          <input
            id="arrival_time" name="arrival_time" type="time" required
            defaultValue={flight?.arrival_time?.slice(0, 5) ?? ''}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-1">
          Opmerkingen <span className="text-gray-400 font-normal">(optioneel)</span>
        </label>
        <textarea
          id="remarks" name="remarks" rows={3}
          defaultValue={flight?.remarks ?? ''}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
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
