import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ReservationForm } from '@/components/reserveringen/reservation-form'
import { addReservation } from '@/app/actions/reservations'
import Link from 'next/link'
import { ChevronLeftIcon } from 'lucide-react'

export default async function NieuweReserveringPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: aircraft }, { data: members }] = await Promise.all([
    supabase.from('aircraft').select('id, registration, type').order('registration'),
    supabase.from('profiles').select('id, full_name').order('full_name'),
  ])

  return (
    <div>
      <Link
        href="/dashboard/reserveringen"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ChevronLeftIcon className="h-4 w-4" />
        Terug
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Nieuwe reservering</h1>
      <ReservationForm action={addReservation} aircraft={aircraft ?? []} members={members ?? []} />
    </div>
  )
}
