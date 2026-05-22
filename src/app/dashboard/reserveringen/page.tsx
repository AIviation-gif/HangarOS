import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PlusIcon } from 'lucide-react'
import { DeleteReservationButton } from '@/components/reserveringen/delete-reservation-button'

const statusBadge: Record<string, string> = {
  aangevraagd: 'bg-yellow-100 text-yellow-800',
  bevestigd:   'bg-green-100 text-green-800',
  geannuleerd: 'bg-gray-100 text-gray-500',
}

const statusLabel: Record<string, string> = {
  aangevraagd: 'Aangevraagd',
  bevestigd:   'Bevestigd',
  geannuleerd: 'Geannuleerd',
}

function formatDt(iso: string) {
  return new Date(iso).toLocaleString('nl-NL', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default async function ReserveringenPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: reservations } = await supabase
    .from('reservations')
    .select(`
      id, starts_at, ends_at, status,
      aircraft:aircraft_id ( registration ),
      member:member_id ( full_name )
    `)
    .order('starts_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reserveringen</h1>
        <Link
          href="/dashboard/reserveringen/nieuw"
          className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4" />
          Nieuwe reservering
        </Link>
      </div>

      {!reservations || reservations.length === 0 ? (
        <p className="text-gray-500 text-sm">Nog geen reserveringen.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Van</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Tot</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Vliegtuig</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Lid</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {reservations.map((r) => {
                const aircraft = r.aircraft as unknown as { registration: string } | null
                const member   = r.member   as unknown as { full_name: string } | null
                return (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{formatDt(r.starts_at)}</td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{formatDt(r.ends_at)}</td>
                    <td className="px-4 py-3 font-mono font-medium">{aircraft?.registration ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-700">{member?.full_name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge[r.status] ?? 'bg-gray-100 text-gray-700'}`}>
                        {statusLabel[r.status] ?? r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-3">
                      <Link
                        href={`/dashboard/reserveringen/${r.id}/bewerken`}
                        className="text-blue-600 hover:underline"
                      >
                        Bewerken
                      </Link>
                      <DeleteReservationButton id={r.id} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
