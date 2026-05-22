'use client'

import { useActionState } from 'react'

type SettingsState = { error: string } | { success: true } | undefined

type Profile = {
  full_name: string
  license_number: string | null
  phone: string | null
  role: string
}

type Props = {
  action: (state: SettingsState, formData: FormData) => Promise<SettingsState>
  profile: Profile
}

const roleLabel: Record<string, string> = {
  admin:       'Admin',
  instructeur: 'Instructeur',
  lid:         'Lid',
}

export function ProfileForm({ action, profile }: Props) {
  const [state, formAction, pending] = useActionState(action, undefined)

  return (
    <form action={formAction} className="space-y-5 max-w-lg">
      {state && 'error' in state && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {state.error}
        </p>
      )}
      {state && 'success' in state && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
          Wijzigingen opgeslagen.
        </p>
      )}

      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">Naam</label>
        <input
          id="full_name" name="full_name" type="text" required
          defaultValue={profile.full_name}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-1">Rol</p>
        <p className="text-sm text-gray-500">{roleLabel[profile.role] ?? profile.role}</p>
      </div>

      <div>
        <label htmlFor="license_number" className="block text-sm font-medium text-gray-700 mb-1">
          Brevetnummer <span className="text-gray-400 font-normal">(optioneel)</span>
        </label>
        <input
          id="license_number" name="license_number" type="text"
          defaultValue={profile.license_number ?? ''}
          placeholder="NL.FCL.1234567"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          Telefoonnummer <span className="text-gray-400 font-normal">(optioneel)</span>
        </label>
        <input
          id="phone" name="phone" type="tel"
          defaultValue={profile.phone ?? ''}
          placeholder="+31 6 12345678"
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
