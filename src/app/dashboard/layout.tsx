import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/dashboard/sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, clubs(name)')
    .eq('id', user.id)
    .single()

  const clubName =
    profile?.clubs && !Array.isArray(profile.clubs)
      ? (profile.clubs as { name: string }).name
      : 'Mijn Club'

  return (
    <div className="flex h-full">
      <Sidebar
        clubName={clubName}
        userName={profile?.full_name || user.email!}
        userRole={profile?.role ?? 'lid'}
      />
      <main className="flex-1 overflow-auto bg-zinc-50">{children}</main>
    </div>
  )
}
