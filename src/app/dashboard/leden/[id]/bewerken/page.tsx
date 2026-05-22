import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { MemberForm } from '@/components/leden/member-form'
import { updateMember } from '@/app/actions/members'
import { DocumentSection } from '@/components/documenten/document-section'
import Link from 'next/link'
import { ChevronLeftIcon } from 'lucide-react'

export default async function BewerkenPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: member }, { data: documents }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, role, license_number, license_expiry, medical_expiry, ratings, phone')
      .eq('id', id)
      .single(),
    supabase
      .from('documents')
      .select('id, name, file_url, created_at')
      .eq('member_id', id)
      .order('created_at', { ascending: false }),
  ])

  if (!member) notFound()

  return (
    <div className="max-w-lg space-y-8">
      <div>
        <Link
          href="/dashboard/leden"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Terug
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{member.full_name} bewerken</h1>
        <MemberForm action={updateMember} member={member} />
      </div>

      <div>
        <h2 className="font-semibold text-gray-800 mb-3">Documenten</h2>
        <DocumentSection
          documents={documents ?? []}
          category="member"
          relatedId={id}
          revalidatePath={`/dashboard/leden/${id}/bewerken`}
        />
      </div>
    </div>
  )
}
