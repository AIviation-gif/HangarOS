import { LoginForm } from '@/components/auth/login-form'

export const metadata = {
  title: 'Inloggen — HangarOS',
}

export default function LoginPage() {
  return (
    <div className="flex min-h-full items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">HangarOS</h1>
          <p className="mt-1 text-sm text-zinc-600">Log in op je account</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
