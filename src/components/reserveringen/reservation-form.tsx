'use client'

import { useActionState } from 'react'

type ReservationState = { error: string } | { success: true } | undefined

type Aircraft = { id: string; registration: string; type: string }
type Profile  = { id: string; full_name: string }

type Reservation = {
  id: string
  aircraft_id: string
  member_id: string
  starts_at: string
  ends_at: string
  status: string
}

type Props = {
  action: (state: ReservationState, formData: FormData) => Promise<ReservationState>
  aircraft: Aircraft[]
  members: Profile[]
  reservation?: Reservation
}

const statusOptions = [
  { value: 'aangevraagd', label: 'Aangevraagd' },
  { value: 'bevestigd',   label: 'Bevestigd' },
  { value: 'geannuleerd', label: 'Geannuleerd' },
]

function toDatetimeLocal(iso: string) {
  return iso ? iso.slice(0, 16) : ''
}

function defaultStart() {
  const d = new Date()
  d.setMinutes(0, 0, 0)
  d.setHours(d.getHours() + 1)
  return d.toISOString().slice(0, 16)
}

function defaultEnd() {
  const d = new Date()
  d.setMinutes(0, 0, 0)
  d.setHours(d.getHours() + 3)
  return d.toISOString().slice(0, 16)
}

export function ReservationForm({ action, aircraft, members, reservation }: Props) {
  const [state, formAction, pending] = useActionState(action, undefined)

  return (
    <form action={formAction} className="space-y-5 max-w-lg">
      {reservation && <input type="hidden" name="_id" value={reservation.id} />}

      {state && 'error' in state && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {state.error}
        </p>
      )}

      <div>
        <label htmlFor="aircraft_id" className="block text-sm font-medium text-gray-700 mb-1">Vliegtuig</label>
        <select
          id="aircraft_id" name="aircraft_id" required
          defaultValue={reservation?.aircraft_id ?? ''}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="" disabled>Selecteer vliegtuig</option>
          {aircraft.map((a) => (
            <option key={a.id} value={a.id}>{a.registration} — {a.type}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="member_id" className="block text-sm font-medium text-gray-700 mb-1">Lid</label>
        <select
          id="member_id" name="member_id" required
          defaultValue={reservation?.member_id ?? ''}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="" disabled>Selecteer lid</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>{m.full_name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="starts_at" className="block text-sm font-medium text-gray-700 mb-1">Begintijd</label>
          <input
            id="starts_at" name="starts_at" type="datetime-local" required
            defaultValue={reservation ? toDatetimeLocal(reservation.starts_at) : defaultStart()}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="ends_at" className="block text-sm font-medium text-gray-700 mb-1">Eindtijd</label>
          <input
            id="ends_at" name="ends_at" type="datetime-local" required
            defaultValue={reservation ? toDatetimeLocal(reservation.ends_at) : defaultEnd()}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select
          id="status" name="status"
          defaultValue={reservation?.status ?? 'aangevraagd'}
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
