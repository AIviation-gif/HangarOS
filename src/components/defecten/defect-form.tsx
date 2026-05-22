'use client'

import { useActionState } from 'react'

type DefectState = { error: string } | { success: true } | undefined
type Aircraft = { id: string; registration: string; type: string }

type Props = {
  action: (state: DefectState, formData: FormData) => Promise<DefectState>
  aircraft: Aircraft[]
  preselectedAircraftId?: string
}

export function DefectForm({ action, aircraft, preselectedAircraftId }: Props) {
  const [state, formAction, pending] = useActionState(action, undefined)

  return (
    <form action={formAction} className="space-y-5 max-w-lg" encType="multipart/form-data">
      {state && 'error' in state && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {state.error}
        </p>
      )}

      <div>
        <label htmlFor="aircraft_id" className="block text-sm font-medium text-gray-700 mb-1">Vliegtuig</label>
        <select
          id="aircraft_id" name="aircraft_id" required
          defaultValue={preselectedAircraftId ?? ''}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="" disabled>Selecteer vliegtuig</option>
          {aircraft.map((a) => (
            <option key={a.id} value={a.id}>{a.registration} — {a.type}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="severity" className="block text-sm font-medium text-gray-700 mb-1">Ernst</label>
        <select
          id="severity" name="severity" defaultValue="normal"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="normal">Normaal</option>
          <option value="grounding">Grounding (vliegtuig aan de grond)</option>
        </select>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Omschrijving</label>
        <textarea
          id="description" name="description" rows={4} required
          placeholder="Beschrijf het defect zo duidelijk mogelijk…"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="photo" className="block text-sm font-medium text-gray-700 mb-1">
          Foto <span className="text-gray-400 font-normal">(optioneel, max 5 MB)</span>
        </label>
        <input
          id="photo" name="photo" type="file" accept="image/*"
          className="w-full text-sm text-gray-500 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      <button
        type="submit" disabled={pending}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {pending ? 'Opslaan…' : 'Defect melden'}
      </button>
    </form>
  )
}
