import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const DEMO_ACCOUNTS = [
  { email: 'admin@demo.nl',       password: 'Demo1234!', full_name: 'Demo Admin',       role: 'admin' },
  { email: 'instructeur@demo.nl', password: 'Demo1234!', full_name: 'Demo Instructeur', role: 'instructeur' },
  { email: 'lid@demo.nl',         password: 'Demo1234!', full_name: 'Demo Lid',          role: 'lid' },
]

export async function GET() {
  const url     = process.env.NEXT_PUBLIC_SUPABASE_URL
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !service) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY ontbreekt.' }, { status: 500 })
  }

  const supabase = createClient(url, service, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // Haal alle bestaande users op zodat we bij dubbelen hun ID kunnen opzoeken
  const { data: listData } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  const existingUsers = listData?.users ?? []

  function findUserId(email: string) {
    return existingUsers.find((u) => u.email === email)?.id ?? null
  }

  // Stap 1: Demo Club aanmaken of ophalen
  let clubId: string

  const { data: existingClub } = await supabase
    .from('clubs')
    .select('id')
    .eq('slug', 'demo-club')
    .maybeSingle()

  if (existingClub) {
    clubId = existingClub.id
  } else {
    const { data: newClub, error: clubErr } = await supabase
      .from('clubs')
      .insert({ name: 'Demo Club', slug: 'demo-club' })
      .select('id')
      .single()
    if (clubErr || !newClub) {
      return NextResponse.json({ error: `Club aanmaken mislukt: ${clubErr?.message}` }, { status: 500 })
    }
    clubId = newClub.id
  }

  const results = []

  // Stap 2: gebruikers aanmaken en profielen upserten
  for (const account of DEMO_ACCOUNTS) {
    let userId = findUserId(account.email)

    if (!userId) {
      const { data: created, error: createErr } = await supabase.auth.admin.createUser({
        email: account.email,
        password: account.password,
        email_confirm: true,
      })
      if (createErr) {
        results.push({ email: account.email, status: `fout: ${createErr.message}` })
        continue
      }
      userId = created.user.id
    }

    const { error: profileErr } = await supabase.from('profiles').upsert({
      id:       userId,
      club_id:  clubId,
      full_name: account.full_name,
      role:     account.role,
    }, { onConflict: 'id' })

    results.push({
      email:  account.email,
      role:   account.role,
      status: profileErr ? `profiel fout: ${profileErr.message}` : 'ok',
    })
  }

  return NextResponse.json({ ok: true, clubId, results })
}
