'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { login } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'

const DEMO = [
  { label: 'Admin',        email: 'admin@demo.nl',       password: 'Demo1234!' },
  { label: 'Instructeur',  email: 'instructeur@demo.nl', password: 'Demo1234!' },
  { label: 'Lid',          email: 'lid@demo.nl',         password: 'Demo1234!' },
]

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined)
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')

  function fillDemo(e: string, p: string) {
    setEmail(e)
    setPassword(p)
  }

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-zinc-700">
          E-mailadres
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-zinc-700">
          Wachtwoord
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        />
      </div>
      {state?.error && (
        <p className="text-sm text-red-600" role="alert">{state.error}</p>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? 'Bezig…' : 'Inloggen'}
      </Button>

      <div className="pt-2">
        <p className="text-xs text-zinc-400 mb-2 text-center">Inloggen als demo-account</p>
        <div className="flex gap-2">
          {DEMO.map(({ label, email: e, password: p }) => (
            <button
              key={label}
              type="button"
              onClick={() => fillDemo(e, p)}
              className="flex-1 rounded-md border border-zinc-200 px-2 py-1.5 text-xs text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300 transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-center text-sm text-zinc-600">
        Nog geen account?{' '}
        <Link href="/register" className="font-medium text-zinc-900 hover:underline">
          Registreer hier
        </Link>
      </p>
    </form>
  )
}
