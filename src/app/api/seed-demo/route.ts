import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const DEMO_ACCOUNTS = [
  { email: 'admin@demo.nl',        password: 'Demo1234!', full_name: 'Demo Admin',        role: 'admin' },
  { email: 'instructeur@demo.nl',  password: 'Demo1234!', full_name: 'Demo Instructeur',  role: 'instructeur' },
  { email: 'lid@demo.nl',          password: 'Demo1234!', full_name: 'Demo Lid',           role: 'lid' },
]

export async function GET() {
  const url     = process.env.NEXT_PUBLIC_SUPABASE_URL
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !service) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY ontbreekt in env vars.' }, { status: 500 })
  }

  const supabase = createClient(url, service, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // Stap 1: admin aanmaken → nieuwe Demo Club
  const admin = DEMO_ACCOUNTS[0]
  const { data: adminUser, error: adminErr } = await supabase.auth.admin.createUser({
    email: admin.email, password: admin.password, email_confirm: true,
  })
  if (adminErr && !adminErr.message.includes('already been registered')) {
    return NextResponse.json({ error: adminErr.message }, { status: 500 })
  }

  // Club opzoeken of aanmaken
  let clubId: string | null = null

  const { data: existingClub } = await supabase
    .from('clubs')
    .select('id')
    .eq('slug', 'demo-club')
    .single()

  if (existingClub) {
    clubId = existingClub.id
  } else {
    const { data: newClub, error: clubErr } = await supabase
      .from('clubs')
      .insert({ name: 'Demo Club', slug: 'demo-club' })
      .select('id')
      .single()
    if (clubErr) return NextResponse.json({ error: clubErr.message }, { status: 500 })
    clubId = newClub!.id
  }

  // Stap 2: alle drie profielen aanmaken (upsert)
  for (const account of DEMO_ACCOUNTS) {
    let userId: string | null = null

    if (account.email === admin.email && adminUser?.user) {
      userId = adminUser.user.id
    } else {
      const { data: created, error: createErr } = await supabase.auth.admin.createUser({
        email: account.email, password: account.password, email_confirm: true,
      })
      if (createErr && !createErr.message.includes('already been registered')) {
        return NextResponse.json({ error: createErr.message }, { status: 500 })
      }
      if (created?.user) {
        userId = created.user.id
      } else {
        // Al bestaand — opzoeken via listUsers
        const { data: list } = await supabase.auth.admin.listUsers()
        userId = list?.users.find((u) => u.email === account.email)?.id ?? null
      }
    }

    if (!userId) continue

    await supabase.from('profiles').upsert({
      id: userId, club_id: clubId, full_name: account.full_name, role: account.role,
    }, { onConflict: 'id' })
  }

  return NextResponse.json({
    ok: true,
    accounts: DEMO_ACCOUNTS.map(({ email, password, role }) => ({ email, password, role })),
  })
}
