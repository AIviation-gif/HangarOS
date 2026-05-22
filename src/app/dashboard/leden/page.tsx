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

export default async function LedenPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: members } = await supabase
    .from('profiles')
    .select('id, full_name, role, license_number, phone, created_at')
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
                <th className="px-4 py-3 text-left font-medium text-gray-500">Telefoon</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Lid sinds</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{m.full_name}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${roleBadge[m.role] ?? 'bg-gray-100 text-gray-600'}`}>
                      {roleLabel[m.role] ?? m.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-gray-500 text-xs">{m.license_number ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{m.phone ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(m.created_at).toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/dashboard/leden/${m.id}/bewerken`} className="text-blue-600 hover:underline">
                      Bewerken
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
