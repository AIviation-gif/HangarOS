import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { AircraftForm } from '@/components/vliegtuigen/aircraft-form'
import { updateAircraft } from '@/app/actions/aircraft'
import Link from 'next/link'
import { ChevronLeftIcon } from 'lucide-react'

export default async function BewerkenPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: aircraft } = await supabase
    .from('aircraft')
    .select('*')
    .eq('id', id)
    .single()

  if (!aircraft) notFound()

  return (
    <div>
      <Link
        href="/dashboard/vliegtuigen"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ChevronLeftIcon className="h-4 w-4" />
        Terug
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {aircraft.registration} bewerken
      </h1>
      <AircraftForm action={updateAircraft} aircraft={aircraft} />
    </div>
  )
}
