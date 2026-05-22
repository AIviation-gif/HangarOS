import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Dashboard — HangarOS',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, clubs(name)')
    .eq('id', user!.id)
    .single()

  const [{ count: aircraftCount }, { count: flightCount }, { count: reservationCount }] =
    await Promise.all([
      supabase.from('aircraft').select('*', { count: 'exact', head: true }),
      supabase.from('flights').select('*', { count: 'exact', head: true }),
      supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'aangevraagd'),
    ])

  const clubName =
    profile?.clubs && !Array.isArray(profile.clubs)
      ? (profile.clubs as { name: string }).name
      : 'Jouw club'

  const stats = [
    { label: 'Vliegtuigen', value: aircraftCount ?? 0 },
    { label: 'Vluchten',    value: flightCount ?? 0 },
    { label: 'Open reserveringen', value: reservationCount ?? 0 },
  ]

  return (
    <div className="px-6 py-8">
      <h1 className="text-xl font-semibold text-zinc-900">
        Welkom{profile?.full_name ? `, ${profile.full_name}` : ''}
      </h1>
      <p className="mt-0.5 text-sm text-zinc-500">{clubName}</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map(({ label, value }) => (
          <div
            key={label}
            className="rounded-lg border border-zinc-200 bg-white px-5 py-4"
          >
            <p className="text-sm text-zinc-500">{label}</p>
            <p className="mt-1 text-2xl font-semibold text-zinc-900">{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
