import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const roleBadge: Record<string, string> = {
  admin:       'bg-purple-100 text-purple-800',
  instructeur: 'bg-blue-100 text-blue-800',
  lid:         'bg-gray-100 text-gray-600',
}
const roleLabel: Record<string, string> = {
  admin:       'Admin',
  instructeur: 'Instructeur',
  lid:         'Lid',
}

function expiryBadge(dateStr: string | null, label: string) {
  if (!dateStr) return null
  const days = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000)
  if (days < 0)   return { text: `${label} verlopen`,         cls: 'bg-red-100 text-red-700' }
  if (days <= 30) return { text: `${label} verloopt over ${days}d`, cls: 'bg-red-100 text-red-700' }
  if (days <= 60) return { text: `${label} verloopt over ${days}d`, cls: 'bg-amber-100 text-amber-700' }
  return null
}

export default async function LedenPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: members } = await supabase
    .from('profiles')
    .select('id, full_name, role, license_number, license_expiry, medical_expiry, ratings, phone, created_at')
    .order('full_name')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Leden</h1>
        <span className="text-sm text-gray-400">{members?.length ?? 0} leden</span>
      </div>

      {!members || members.length === 0 ? (
        <p className="text-gray-500 text-sm">Nog geen leden geregistreerd.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Naam</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Rol</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Brevet</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Bevoegdheden</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Waarschuwingen</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Telefoon</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {members.map((m) => {
                const licenseBadge = expiryBadge(m.license_expiry, 'Brevet')
                const medicalBadge = expiryBadge(m.medical_expiry, 'Medical')
                return (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{m.full_name}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${roleBadge[m.role] ?? 'bg-gray-100 text-gray-600'}`}>
                        {roleLabel[m.role] ?? m.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-500 text-xs">{m.license_number ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{m.ratings ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        {licenseBadge && (
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${licenseBadge.cls}`}>
                            {licenseBadge.text}
                          </span>
                        )}
                        {medicalBadge && (
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${medicalBadge.cls}`}>
                            {medicalBadge.text}
                          </span>
                        )}
                        {!licenseBadge && !medicalBadge && (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{m.phone ?? '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/dashboard/leden/${m.id}/bewerken`} className="text-blue-600 hover:underline">
                        Bewerken
                      </Link>
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
