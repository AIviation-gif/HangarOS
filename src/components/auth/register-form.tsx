'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { register } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'

export function RegisterForm() {
  const [state, action, pending] = useActionState(register, undefined)

  if (state?.success) {
    return (
      <div className="space-y-2 text-center">
        <p className="font-medium text-zinc-900">Controleer je e-mail</p>
        <p className="text-sm text-zinc-600">
          We hebben een bevestigingslink gestuurd naar <strong>{state.email}</strong>.
          Klik op de link om je account te activeren.
        </p>
      </div>
    )
  }

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-zinc-700">
          Volledige naam
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          required
          autoComplete="name"
          className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        />
      </div>
      <div>
        <label htmlFor="club_name" className="block text-sm font-medium text-zinc-700">
          Naam van de club
        </label>
        <input
          id="club_name"
          name="club_name"
          type="text"
          required
          className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        />
      </div>
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
          autoComplete="new-password"
          minLength={8}
          className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        />
      </div>
      {state?.error && (
        <p className="text-sm text-red-600" role="alert">{state.error}</p>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? 'Bezig…' : 'Club aanmaken & registreren'}
      </Button>
      <p className="text-center text-sm text-zinc-600">
        Al een account?{' '}
        <Link href="/login" className="font-medium text-zinc-900 hover:underline">
          Log in
        </Link>
      </p>
    </form>
  )
}
