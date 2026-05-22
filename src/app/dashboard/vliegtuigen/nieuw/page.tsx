import { AircraftForm } from '@/components/vliegtuigen/aircraft-form'
import { addAircraft } from '@/app/actions/aircraft'
import Link from 'next/link'
import { ChevronLeftIcon } from 'lucide-react'

export default function NieuwVliegtuigPage() {
  return (
    <div>
      <Link
        href="/dashboard/vliegtuigen"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ChevronLeftIcon className="h-4 w-4" />
        Terug
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Nieuw vliegtuig</h1>
      <AircraftForm action={addAircraft} />
    </div>
  )
}
