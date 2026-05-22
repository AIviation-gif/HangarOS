import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DefectForm } from '@/components/defecten/defect-form'
import { addDefect } from '@/app/actions/defects'
import Link from 'next/link'
import { ChevronLeftIcon } from 'lucide-react'

export default async function NieuwDefectPage({
  searchParams,
}: {
  searchParams: Promise<{ aircraft_id?: string }>
}) {
  const { aircraft_id } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: aircraft } = await supabase
    .from('aircraft')
    .select('id, registration, type')
    .order('registration')

  return (
    <div>
      <Link href="/dashboard/defecten" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ChevronLeftIcon className="h-4 w-4" />
        Terug
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Defect melden</h1>
      <DefectForm action={addDefect} aircraft={aircraft ?? []} preselectedAircraftId={aircraft_id} />
    </div>
  )
}
