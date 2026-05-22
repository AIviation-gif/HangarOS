'use client'

import { useActionState } from 'react'

type MemberState = { error: string } | { success: true } | undefined

type Member = {
  id: string
  full_name: string
  role: string
  license_number: string | null
  license_expiry: string | null
  medical_expiry: string | null
  ratings: string | null
  phone: string | null
}

type Props = {
  action: (state: MemberState, formData: FormData) => Promise<MemberState>
  member: Member
}

const roleOptions = [
  { value: 'lid',         label: 'Lid' },
  { value: 'instructeur', label: 'Instructeur' },
  { value: 'admin',       label: 'Admin' },
]

export function MemberForm({ action, member }: Props) {
  const [state, formAction, pending] = useActionState(action, undefined)

  return (
    <form action={formAction} className="space-y-5 max-w-lg">
      <input type="hidden" name="_id" value={member.id} />

      {state && 'error' in state && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {state.error}
        </p>
      )}

      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">Naam</label>
        <input
          id="full_name" name="full_name" type="text" required
          defaultValue={member.full_name}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
        <select
          id="role" name="role"
          defaultValue={member.role}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {roleOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          Telefoonnummer <span className="text-gray-400 font-normal">(optioneel)</span>
        </label>
        <input
          id="phone" name="phone" type="tel"
          defaultValue={member.phone ?? ''}
          placeholder="+31 6 12345678"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <hr className="border-gray-100" />
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Brevet &amp; bevoegdheden</p>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="license_number" className="block text-sm font-medium text-gray-700 mb-1">Brevetnummer</label>
          <input
            id="license_number" name="license_number" type="text"
            defaultValue={member.license_number ?? ''}
            placeholder="NL.FCL.1234567"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="license_expiry" className="block text-sm font-medium text-gray-700 mb-1">Brevet vervaldatum</label>
          <input
            id="license_expiry" name="license_expiry" type="date"
            defaultValue={member.license_expiry ?? ''}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="medical_expiry" className="block text-sm font-medium text-gray-700 mb-1">Medical vervaldatum</label>
        <input
          id="medical_expiry" name="medical_expiry" type="date"
          defaultValue={member.medical_expiry ?? ''}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="ratings" className="block text-sm font-medium text-gray-700 mb-1">
          Bevoegdverklaringen <span className="text-gray-400 font-normal">(optioneel)</span>
        </label>
        <input
          id="ratings" name="ratings" type="text"
          defaultValue={member.ratings ?? ''}
          placeholder="SEP, TMG, IR, Night"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-gray-400">Kommagescheiden, bijv. SEP, TMG, Night</p>
      </div>

      <button
        type="submit" disabled={pending}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {pending ? 'Opslaan…' : 'Opslaan'}
      </button>
    </form>
  )
}
