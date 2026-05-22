import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PlusIcon } from 'lucide-react'
import { DeleteButton } from '@/components/vliegtuigen/delete-button'

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

function inspectionBadge(remaining: number) {
  if (remaining <= 0)  return { label: `${remaining.toFixed(0)}u — vervallen`, cls: 'bg-red-100 text-red-700' }
  if (remaining <= 10) return { label: `${remaining.toFixed(0)}u resterend`, cls: 'bg-amber-100 text-amber-800' }
  return { label: `${remaining.toFixed(0)}u resterend`, cls: 'bg-gray-100 text-gray-600' }
}

export default async function VliegtuigenPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: aircraft } = await supabase
    .from('aircraft')
    .select('*')
    .order('registration')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Vliegtuigen</h1>
        <Link
          href="/dashboard/vliegtuigen/nieuw"
          className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4" />
          Nieuw vliegtuig
        </Link>
      </div>

      {!aircraft || aircraft.length === 0 ? (
        <p className="text-gray-500 text-sm">Nog geen vliegtuigen toegevoegd.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Registratie</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Type</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Uren</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Inspectie</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {aircraft.map((a) => {
                const remaining = (Number(a.hours_at_last_inspection) + Number(a.inspection_interval)) - Number(a.total_hours)
                const badge = inspectionBadge(remaining)
                return (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono font-medium">{a.registration}</td>
                    <td className="px-4 py-3 text-gray-700">{a.type}</td>
                    <td className="px-4 py-3 text-gray-700">{Number(a.total_hours).toFixed(1)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge[a.status] ?? 'bg-gray-100 text-gray-700'}`}>
                        {statusLabel[a.status] ?? a.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-3">
                      <Link href={`/dashboard/vliegtuigen/${a.id}/bewerken`} className="text-blue-600 hover:underline">
                        Bewerken
                      </Link>
                      <DeleteButton id={a.id} registration={a.registration} />
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
