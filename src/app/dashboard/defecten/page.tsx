import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PlusIcon } from 'lucide-react'
import { StatusButton } from '@/components/defecten/status-button'

const severityBadge: Record<string, string> = {
  normal:    'bg-yellow-100 text-yellow-800',
  grounding: 'bg-red-100 text-red-800',
}
const severityLabel: Record<string, string> = {
  normal:    'Normaal',
  grounding: 'Grounding',
}
const statusBadge: Record<string, string> = {
  open:        'bg-red-100 text-red-700',
  in_progress: 'bg-yellow-100 text-yellow-800',
  resolved:    'bg-green-100 text-green-800',
}
const statusLabel: Record<string, string> = {
  open:        'Open',
  in_progress: 'In behandeling',
  resolved:    'Opgelost',
}

export default async function DefectenPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: defects } = await supabase
    .from('defects')
    .select(`
      id, description, severity, status, photo_url, created_at,
      aircraft:aircraft_id ( registration ),
      reporter:reported_by ( full_name )
    `)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Defecten</h1>
        <Link
          href="/dashboard/defecten/nieuw"
          className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4" />
          Defect melden
        </Link>
      </div>

      {!defects || defects.length === 0 ? (
        <p className="text-gray-500 text-sm">Geen defecten gemeld.</p>
      ) : (
        <div className="space-y-3">
          {defects.map((d) => {
            const aircraft = d.aircraft as unknown as { registration: string } | null
            const reporter = d.reporter as unknown as { full_name: string } | null
            return (
              <div key={d.id} className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-mono font-semibold text-sm">{aircraft?.registration ?? '—'}</span>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${severityBadge[d.severity]}`}>
                        {severityLabel[d.severity]}
                      </span>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge[d.status]}`}>
                        {statusLabel[d.status]}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2">{d.description}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {reporter?.full_name ?? '—'} · {new Date(d.created_at).toLocaleDateString('nl-NL')}
                    </p>
                  </div>
                  {d.photo_url && (
                    <img src={d.photo_url} alt="foto" className="h-16 w-16 rounded-md object-cover shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
                  <Link href={`/dashboard/defecten/${d.id}`} className="text-sm text-blue-600 hover:underline">
                    Details
                  </Link>
                  <StatusButton id={d.id} currentStatus={d.status} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
