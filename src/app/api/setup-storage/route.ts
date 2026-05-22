import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!service) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY ontbreekt.' }, { status: 500 })

  const supabase = createClient('https://biijudfrsisyaukcjdaa.supabase.co', service, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { error } = await supabase.storage.createBucket('defect-photos', {
    public: true,
    allowedMimeTypes: ['image/*'],
    fileSizeLimit: 5242880,
  })

  if (error && !error.message.includes('already exists')) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
