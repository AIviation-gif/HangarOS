import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const metadata = {
  title: 'Dashboard — HangarOS',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, clubs(name)')
    .eq('id', user!.id)
    .single()

  const [
    { count: aircraftCount },
    { count: flightCount },
    { count: reservationCount },
    { count: openDefectCount },
    { count: groundingCount },
  ] = await Promise.all([
    supabase.from('aircraft').select('*', { count: 'exact', head: true }),
    supabase.from('flights').select('*', { count: 'exact', head: true }),
    supabase.from('reservations').select('*', { count: 'exact', head: true }).eq('status', 'aangevraagd'),
    supabase.from('defects').select('*', { count: 'exact', head: true }).in('status', ['open', 'in_progress']),
    supabase.from('defects').select('*', { count: 'exact', head: true }).eq('severity', 'grounding').in('status', ['open', 'in_progress']),
  ])

  const clubName =
    profile?.clubs && !Array.isArray(profile.clubs)
      ? (profile.clubs as { name: string }).name
      : 'Jouw club'

  const stats = [
    { label: 'Vliegtuigen',         value: aircraftCount  ?? 0, href: '/dashboard/vliegtuigen',   urgent: false },
    { label: 'Vluchten',            value: flightCount    ?? 0, href: '/dashboard/vluchten',       urgent: false },
    { label: 'Open reserveringen',  value: reservationCount ?? 0, href: '/dashboard/reserveringen', urgent: false },
    { label: 'Open defecten',       value: openDefectCount ?? 0, href: '/dashboard/defecten',       urgent: false },
    { label: 'Groundings',          value: groundingCount ?? 0, href: '/dashboard/defecten',        urgent: (groundingCount ?? 0) > 0 },
  ]

  return (
    <div className="px-6 py-8">
      <h1 className="text-xl font-semibold text-zinc-900">
        Welkom{profile?.full_name ? `, ${profile.full_name}` : ''}
      </h1>
      <p className="mt-0.5 text-sm text-zinc-500">{clubName}</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map(({ label, value, href, urgent }) => (
          <Link
            key={label}
            href={href}
            className={`rounded-lg border px-5 py-4 transition-colors hover:bg-zinc-50 ${
              urgent ? 'border-red-200 bg-red-50' : 'border-zinc-200 bg-white'
            }`}
          >
            <p className={`text-sm ${urgent ? 'text-red-600' : 'text-zinc-500'}`}>{label}</p>
            <p className={`mt-1 text-2xl font-semibold ${urgent ? 'text-red-700' : 'text-zinc-900'}`}>{value}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
