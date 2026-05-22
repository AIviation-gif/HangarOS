import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { PlusIcon } from 'lucide-react'

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
    { data: allAircraft },
    { data: recentPosts },
  ] = await Promise.all([
    supabase.from('aircraft').select('*', { count: 'exact', head: true }),
    supabase.from('flights').select('*', { count: 'exact', head: true }),
    supabase.from('reservations').select('*', { count: 'exact', head: true }).eq('status', 'aangevraagd'),
    supabase.from('defects').select('*', { count: 'exact', head: true }).in('status', ['open', 'in_progress']),
    supabase.from('defects').select('*', { count: 'exact', head: true }).eq('severity', 'grounding').in('status', ['open', 'in_progress']),
    supabase.from('aircraft').select('total_hours, inspection_interval, hours_at_last_inspection'),
    supabase
      .from('posts')
      .select('id, title, content, cover_image_url, published_at, author:author_id ( full_name )')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(3),
  ])

  const inspectionDueCount = (allAircraft ?? []).filter((a) =>
    (Number(a.hours_at_last_inspection) + Number(a.inspection_interval)) - Number(a.total_hours) <= 10
  ).length

  const clubName =
    profile?.clubs && !Array.isArray(profile.clubs)
      ? (profile.clubs as { name: string }).name
      : 'Jouw club'

  const stats = [
    { label: 'Vliegtuigen',              value: aircraftCount     ?? 0, href: '/dashboard/vliegtuigen',   urgent: false },
    { label: 'Vluchten',                 value: flightCount       ?? 0, href: '/dashboard/vluchten',       urgent: false },
    { label: 'Open reserveringen',       value: reservationCount  ?? 0, href: '/dashboard/reserveringen',  urgent: false },
    { label: 'Open defecten',            value: openDefectCount   ?? 0, href: '/dashboard/defecten',       urgent: false },
    { label: 'Groundings',               value: groundingCount    ?? 0, href: '/dashboard/defecten',       urgent: (groundingCount ?? 0) > 0 },
    { label: 'Toe aan inspectie (≤10u)', value: inspectionDueCount,    href: '/dashboard/vliegtuigen',    urgent: inspectionDueCount > 0 },
  ]

  return (
    <div className="px-6 py-8 space-y-10">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">
          Welkom{profile?.full_name ? `, ${profile.full_name}` : ''}
        </h1>
        <p className="mt-0.5 text-sm text-zinc-500">{clubName}</p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

      {/* Blog */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Laatste berichten</h2>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/blog/nieuw" className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
              <PlusIcon className="h-3.5 w-3.5" />
              Nieuw
            </Link>
            <Link href="/dashboard/blog" className="text-xs text-zinc-400 hover:text-zinc-700">
              Alle berichten →
            </Link>
          </div>
        </div>

        {!recentPosts || recentPosts.length === 0 ? (
          <p className="text-sm text-zinc-400">Nog geen berichten gepubliceerd.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentPosts.map((p) => {
              const author = p.author as unknown as { full_name: string } | null
              const date = p.published_at
                ? new Date(p.published_at).toLocaleDateString('nl-NL', { day: '2-digit', month: 'long' })
                : ''
              return (
                <Link
                  key={p.id}
                  href={`/dashboard/blog/${p.id}`}
                  className="group rounded-lg border border-zinc-200 bg-white overflow-hidden hover:bg-zinc-50 transition-colors"
                >
                  {p.cover_image_url && (
                    <img
                      src={p.cover_image_url}
                      alt=""
                      className="h-36 w-full object-cover"
                    />
                  )}
                  <div className="px-4 py-3">
                    <p className="font-medium text-zinc-900 leading-snug group-hover:underline line-clamp-2">
                      {p.title}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500 line-clamp-2">
                      {p.content.replace(/\n+/g, ' ')}
                    </p>
                    <p className="mt-1 text-xs text-zinc-400">
                      {author?.full_name ?? '—'}{date ? ` · ${date}` : ''}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
