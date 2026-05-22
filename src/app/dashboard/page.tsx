import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Dashboard — HangarOS',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-full bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">HangarOS</h1>
          <form action={logout}>
            <Button type="submit" variant="outline" size="sm">
              Uitloggen
            </Button>
          </form>
        </div>
      </header>
      <main className="px-6 py-8">
        <p className="text-zinc-600">Welkom, {user.email}</p>
        <p className="mt-4 text-sm text-zinc-400">Dashboard — onder constructie</p>
      </main>
    </div>
  )
}
