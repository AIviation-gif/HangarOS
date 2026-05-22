import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PlusIcon } from 'lucide-react'
import { DeleteFlightButton } from '@/components/vluchten/delete-flight-button'

function formatDuration(dep: string, arr: string) {
  const [dh, dm] = dep.split(':').map(Number)
  const [ah, am] = arr.split(':').map(Number)
  const total = (ah * 60 + am) - (dh * 60 + dm)
  if (total <= 0) return '—'
  return `${Math.floor(total / 60)}u${String(total % 60).padStart(2, '0')}`
}

export default async function VluchtenPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: flights } = await supabase
    .from('flights')
    .select(`
      id, date, from_icao, to_icao, departure_time, arrival_time, landings, remarks,
      aircraft:aircraft_id ( registration ),
      pilot:pilot_id ( full_name ),
      instructor:instructor_id ( full_name )
    `)
    .order('date', { ascending: false })
    .order('departure_time', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Vluchtenlogboek</h1>
        <Link
          href="/dashboard/vluchten/nieuw"
          className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4" />
          Vlucht toevoegen
        </Link>
      </div>

      {!flights || flights.length === 0 ? (
        <p className="text-gray-500 text-sm">Nog geen vluchten geregistreerd.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Datum</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Vliegtuig</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Piloot</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Route</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Duur</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Ldg</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {flights.map((f) => {
                const aircraft   = f.aircraft as { registration: string } | null
                const pilot      = f.pilot    as { full_name: string } | null
                const instructor = f.instructor as { full_name: string } | null
                return (
                  <tr key={f.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {new Date(f.date).toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 font-mono font-medium">{aircraft?.registration ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {pilot?.full_name ?? '—'}
                      {instructor && (
                        <span className="text-gray-400 text-xs ml-1">/ {instructor.full_name}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-700">
                      {f.from_icao} → {f.to_icao}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {formatDuration(f.departure_time, f.arrival_time)}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{f.landings}</td>
                    <td className="px-4 py-3 text-right space-x-3">
                      <Link
                        href={`/dashboard/vluchten/${f.id}/bewerken`}
                        className="text-blue-600 hover:underline"
                      >
                        Bewerken
                      </Link>
                      <DeleteFlightButton id={f.id} />
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
