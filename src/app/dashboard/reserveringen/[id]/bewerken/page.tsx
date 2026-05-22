import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ReservationForm } from '@/components/reserveringen/reservation-form'
import { updateReservation } from '@/app/actions/reservations'
import Link from 'next/link'
import { ChevronLeftIcon } from 'lucide-react'

export default async function BewerkenPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: reservation }, { data: aircraft }, { data: members }] = await Promise.all([
    supabase.from('reservations').select('*').eq('id', id).single(),
    supabase.from('aircraft').select('id, registration, type').order('registration'),
    supabase.from('profiles').select('id, full_name').order('full_name'),
  ])

  if (!reservation) notFound()

  return (
    <div>
      <Link
        href="/dashboard/reserveringen"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ChevronLeftIcon className="h-4 w-4" />
        Terug
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Reservering bewerken</h1>
      <ReservationForm action={updateReservation} aircraft={aircraft ?? []} members={members ?? []} reservation={reservation} />
    </div>
  )
}
