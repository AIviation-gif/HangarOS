import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeftIcon, PlusIcon } from 'lucide-react'
import { StatusActionButton } from '@/components/vliegtuigen/status-action-button'
import { InspectionButton } from '@/components/vliegtuigen/inspection-button'
import { StatusButton } from '@/components/defecten/status-button'

const statusBadge: Record<string, string> = {
  beschikbaar:  'bg-green-100 text-green-800',
  onderhoud:    'bg-amber-100 text-amber-800',
  gereserveerd: 'bg-blue-100 text-blue-800',
}
const statusLabel: Record<string, string> = {
  beschikbaar:  'Beschikbaar',
  onderhoud:    'Onderhoud',
  gereserveerd: 'Gereserveerd',
}
const defectSeverityBadge: Record<string, string> = {
  normal:    'bg-yellow-100 text-yellow-800',
  grounding: 'bg-red-100 text-red-800',
}
const defectStatusBadge: Record<string, string> = {
  open:        'bg-red-100 text-red-700',
  in_progress: 'bg-yellow-100 text-yellow-800',
  resolved:    'bg-green-100 text-green-800',
}
const defectStatusLabel: Record<string, string> = {
  open:        'Open',
  in_progress: 'In behandeling',
  resolved:    'Opgelost',
}

function inspectionInfo(a: { total_hours: number; inspection_interval: number; hours_at_last_inspection: number }) {
  const remaining = (Number(a.hours_at_last_inspection) + Number(a.inspection_interval)) - Number(a.total_hours)
  const interval  = Number(a.inspection_interval)
  if (remaining <= 0)  return { text: `${Math.abs(remaining).toFixed(1)}u vervallen — inspectie vereist`, cls: 'text-red-600 font-semibold' }
  if (remaining <= 5)  return { text: `Nog ${remaining.toFixed(1)}u tot de ${interval}-uurs inspectie`, cls: 'text-red-500 font-medium' }
  if (remaining <= 10) return { text: `Nog ${remaining.toFixed(1)}u tot de ${interval}-uurs inspectie`, cls: 'text-amber-600 font-medium' }
  return { text: `Nog ${remaining.toFixed(1)}u tot de ${interval}-uurs inspectie`, cls: 'text-gray-600' }
}

export default async function VliegtuigDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: aircraft }, { data: defects }] = await Promise.all([
    supabase.from('aircraft').select('*').eq('id', id).single(),
    supabase
      .from('defects')
      .select('id, description, severity, status, photo_url, created_at, reporter:reported_by(full_name)')
      .eq('aircraft_id', id)
      .order('created_at', { ascending: false }),
  ])

  if (!aircraft) notFound()

  const { text: inspText, cls: inspCls } = inspectionInfo(aircraft)

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link href="/dashboard/vliegtuigen" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3">
          <ChevronLeftIcon className="h-4 w-4" />
          Vliegtuigen
        </Link>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold font-mono text-gray-900">{aircraft.registration}</h1>
          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge[aircraft.status]}`}>
            {statusLabel[aircraft.status]}
          </span>
          <Link href={`/dashboard/vliegtuigen/${id}/bewerken`} className="text-sm text-blue-600 hover:underline ml-auto">
            Bewerken
          </Link>
        </div>
        <p className="text-gray-500 text-sm mt-0.5">{aircraft.type}</p>
      </div>

      {/* Onderhoud */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-4">
        <h2 className="font-semibold text-gray-800">Onderhoud</h2>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-400 text-xs mb-0.5">Totale uren</p>
            <p className="font-medium">{Number(aircraft.total_hours).toFixed(1)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-0.5">Laatste inspectie</p>
            <p className="font-medium">{Number(aircraft.hours_at_last_inspection).toFixed(1)}u</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-0.5">Interval</p>
            <p className="font-medium">{Number(aircraft.inspection_interval).toFixed(0)}u</p>
          </div>
        </div>
        <p className={`text-sm ${inspCls}`}>{inspText}</p>
        <div className="flex gap-2 flex-wrap">
          <InspectionButton id={id} registration={aircraft.registration} />
          <StatusActionButton id={id} currentStatus={aircraft.status} />
        </div>
      </div>

      {/* Defecten */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-800">Defecten</h2>
          <Link
            href={`/dashboard/defecten/nieuw?aircraft_id=${id}`}
            className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
          >
            <PlusIcon className="h-3.5 w-3.5" />
            Melden
          </Link>
        </div>

        {!defects || defects.length === 0 ? (
          <p className="text-gray-500 text-sm">Geen defecten geregistreerd.</p>
        ) : (
          <div className="space-y-2">
            {defects.map((d) => {
              const reporter = d.reporter as unknown as { full_name: string } | null
              return (
                <div key={d.id} className="rounded-lg border border-gray-200 bg-white p-3">
                  <div className="flex items-start gap-3">
                    {d.photo_url && (
                      <img src={d.photo_url} alt="" className="h-14 w-14 rounded object-cover shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex gap-1.5 flex-wrap mb-1">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${defectSeverityBadge[d.severity]}`}>
                          {d.severity === 'grounding' ? 'Grounding' : 'Normaal'}
                        </span>
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${defectStatusBadge[d.status]}`}>
                          {defectStatusLabel[d.status]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2">{d.description}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {reporter?.full_name ?? '—'} · {new Date(d.created_at).toLocaleDateString('nl-NL')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2 pt-2 border-t border-gray-100">
                    <Link href={`/dashboard/defecten/${d.id}`} className="text-xs text-blue-600 hover:underline">
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
    </div>
  )
}
