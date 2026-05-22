import { createClient } from '@/lib/supabase/server'
import { getProfile, isManager } from '@/lib/auth/get-profile'
import { redirect } from 'next/navigation'
import { markFlightsPaid, markFlightPaid } from '@/app/actions/finance'

function fmt(amount: number) {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(amount)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default async function FinancienPage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  const manager = isManager(profile.role)

  const supabase = await createClient()

  const { data: flights } = await supabase
    .from('flights')
    .select(`
      id, date, departure_time, arrival_time, cost, paid, pilot_id,
      aircraft:aircraft_id ( registration ),
      pilot:pilot_id ( id, full_name )
    `)
    .not('cost', 'is', null)
    .order('date', { ascending: false })

  if (!flights) return <p className="text-gray-500 text-sm">Geen vluchtgegevens gevonden.</p>

  // Group by pilot
  type PilotGroup = {
    id: string
    full_name: string
    flights: typeof flights
    totalUnpaid: number
    totalAll: number
  }

  const byPilot = new Map<string, PilotGroup>()
  for (const f of flights) {
    const pilot = f.pilot as unknown as { id: string; full_name: string } | null
    if (!pilot) continue
    if (!byPilot.has(pilot.id)) {
      byPilot.set(pilot.id, { id: pilot.id, full_name: pilot.full_name, flights: [], totalUnpaid: 0, totalAll: 0 })
    }
    const g = byPilot.get(pilot.id)!
    g.flights.push(f)
    g.totalAll += Number(f.cost ?? 0)
    if (!f.paid) g.totalUnpaid += Number(f.cost ?? 0)
  }

  const groups = Array.from(byPilot.values()).sort((a, b) => b.totalUnpaid - a.totalUnpaid)

  // For non-managers: show only own flights
  const visibleGroups = manager
    ? groups
    : groups.filter((g) => g.id === profile.id)

  const totalOpenstaand = visibleGroups.reduce((s, g) => s + g.totalUnpaid, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Financiën</h1>
        <div className="text-right">
          <p className="text-xs text-gray-400">Totaal openstaand</p>
          <p className="text-xl font-semibold text-gray-900">{fmt(totalOpenstaand)}</p>
        </div>
      </div>

      {visibleGroups.length === 0 ? (
        <p className="text-gray-500 text-sm">Geen vluchten met kosten gevonden.</p>
      ) : (
        <div className="space-y-6">
          {visibleGroups.map((g) => (
            <div key={g.id} className="rounded-lg border border-gray-200 bg-white overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                <div>
                  <p className="font-semibold text-gray-900">{g.full_name}</p>
                  <p className="text-xs text-gray-400">
                    Openstaand: <span className={g.totalUnpaid > 0 ? 'text-red-600 font-medium' : 'text-green-600'}>{fmt(g.totalUnpaid)}</span>
                    <span className="ml-2 text-gray-300">·</span>
                    <span className="ml-2">Totaal: {fmt(g.totalAll)}</span>
                  </p>
                </div>
                {manager && g.totalUnpaid > 0 && (
                  <form action={markFlightsPaid.bind(null, g.id)}>
                    <button
                      type="submit"
                      className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
                    >
                      Alles markeren als betaald
                    </button>
                  </form>
                )}
              </div>

              <table className="min-w-full divide-y divide-gray-100 text-sm">
                <thead className="bg-white">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Datum</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Vliegtuig</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Duur</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-400">Kosten</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Status</th>
                    {manager && <th className="px-4 py-2" />}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {g.flights.map((f) => {
                    const aircraft = f.aircraft as unknown as { registration: string } | null
                    const [dh, dm] = f.departure_time.split(':').map(Number)
                    const [ah, am] = f.arrival_time.split(':').map(Number)
                    let mins = (ah * 60 + am) - (dh * 60 + dm)
                    if (mins < 0) mins += 1440
                    const dur = `${Math.floor(mins / 60)}u${String(mins % 60).padStart(2, '0')}`
                    return (
                      <tr key={f.id} className={f.paid ? 'opacity-50' : ''}>
                        <td className="px-4 py-2 text-gray-600">{formatDate(f.date)}</td>
                        <td className="px-4 py-2 font-mono text-gray-700">{aircraft?.registration ?? '—'}</td>
                        <td className="px-4 py-2 text-gray-600">{dur}</td>
                        <td className="px-4 py-2 text-right font-medium">{fmt(Number(f.cost))}</td>
                        <td className="px-4 py-2">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            f.paid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {f.paid ? 'Betaald' : 'Openstaand'}
                          </span>
                        </td>
                        {manager && (
                          <td className="px-4 py-2 text-right">
                            {!f.paid && (
                              <form action={markFlightPaid.bind(null, f.id)}>
                                <button type="submit" className="text-xs text-green-600 hover:underline">
                                  Betaald
                                </button>
                              </form>
                            )}
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
