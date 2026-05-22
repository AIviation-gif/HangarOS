import { RegisterForm } from '@/components/auth/register-form'

export const metadata = {
  title: 'Registreren — HangarOS',
}

export default function RegisterPage() {
  return (
    <div className="flex min-h-full items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">HangarOS</h1>
          <p className="mt-1 text-sm text-zinc-600">Maak een account aan</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <RegisterForm />
        </div>
      </div>
    </div>
  )
}
