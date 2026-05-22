import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeftIcon } from 'lucide-react'
import { StatusButton } from '@/components/defecten/status-button'
import { DeleteDefectButton } from '@/components/defecten/delete-defect-button'

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

export default async function DefectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: defect } = await supabase
    .from('defects')
    .select(`
      id, description, severity, status, photo_url, created_at, resolved_at,
      aircraft:aircraft_id ( registration, type ),
      reporter:reported_by ( full_name )
    `)
    .eq('id', id)
    .single()

  if (!defect) notFound()

  const aircraft = defect.aircraft as unknown as { registration: string; type: string } | null
  const reporter = defect.reporter as unknown as { full_name: string } | null

  return (
    <div className="max-w-lg">
      <Link href="/dashboard/defecten" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ChevronLeftIcon className="h-4 w-4" />
        Terug
      </Link>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <h1 className="text-2xl font-bold text-gray-900 font-mono">{aircraft?.registration ?? '—'}</h1>
        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${severityBadge[defect.severity]}`}>
          {severityLabel[defect.severity]}
        </span>
        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge[defect.status]}`}>
          {statusLabel[defect.status]}
        </span>
      </div>

      {defect.photo_url && (
        <img
          src={defect.photo_url}
          alt="Foto defect"
          className="w-full rounded-lg object-cover mb-4 max-h-72"
        />
      )}

      <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3 text-sm">
        <div>
          <p className="text-gray-400 text-xs mb-0.5">Type</p>
          <p className="text-gray-700">{aircraft?.type ?? '—'}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs mb-0.5">Omschrijving</p>
          <p className="text-gray-700 whitespace-pre-wrap">{defect.description}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs mb-0.5">Gemeld door</p>
          <p className="text-gray-700">{reporter?.full_name ?? '—'}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs mb-0.5">Gemeld op</p>
          <p className="text-gray-700">{new Date(defect.created_at).toLocaleString('nl-NL')}</p>
        </div>
        {defect.resolved_at && (
          <div>
            <p className="text-gray-400 text-xs mb-0.5">Opgelost op</p>
            <p className="text-gray-700">{new Date(defect.resolved_at).toLocaleString('nl-NL')}</p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 mt-4">
        <StatusButton id={defect.id} currentStatus={defect.status} />
        <DeleteDefectButton id={defect.id} />
      </div>
    </div>
  )
}
