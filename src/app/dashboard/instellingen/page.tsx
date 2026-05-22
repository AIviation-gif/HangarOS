import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileForm } from '@/components/instellingen/profile-form'
import { updateProfile } from '@/app/actions/settings'

export default async function InstellingenPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, license_number, phone')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Instellingen</h1>
      <p className="text-sm text-gray-500 mb-6">{user.email}</p>

      <h2 className="text-base font-semibold text-gray-800 mb-4">Mijn profiel</h2>
      <ProfileForm action={updateProfile} profile={profile} />
    </div>
  )
}
