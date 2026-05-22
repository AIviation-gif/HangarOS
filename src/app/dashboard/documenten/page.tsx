import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/auth/get-profile'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FileIcon } from 'lucide-react'

const categoryLabel: Record<string, string> = {
  aircraft: 'Vliegtuig',
  member:   'Lid',
  club:     'Club',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default async function DocumentenPage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  const supabase = await createClient()
  const { data: docs } = await supabase
    .from('documents')
    .select(`
      id, name, file_url, category, created_at,
      aircraft:aircraft_id ( registration ),
      member:member_id ( full_name )
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Documenten</h1>
        <p className="text-sm text-gray-400">{docs?.length ?? 0} documenten</p>
      </div>

      <p className="text-sm text-gray-500">
        Documenten uploaden doe je via de <Link href="/dashboard/vliegtuigen" className="text-blue-600 hover:underline">vliegtuigpagina</Link> of het <Link href="/dashboard/leden" className="text-blue-600 hover:underline">ledenprofiel</Link>.
      </p>

      {!docs || docs.length === 0 ? (
        <p className="text-gray-500 text-sm">Nog geen documenten geüpload.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Naam</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Categorie</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Betreft</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Datum</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {docs.map((d) => {
                const aircraft = d.aircraft as unknown as { registration: string } | null
                const member   = d.member   as unknown as { full_name: string } | null
                return (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileIcon className="h-4 w-4 text-gray-400 shrink-0" />
                        <span className="font-medium text-gray-900">{d.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                        {categoryLabel[d.category] ?? d.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {aircraft?.registration ?? member?.full_name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(d.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <a
                        href={d.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Openen
                      </a>
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
