import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const SUPABASE_URL = 'https://biijudfrsisyaukcjdaa.supabase.co'

export async function GET() {
  const supabase = createClient(
    SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Create storage bucket for post cover images
  const { error: bucketError } = await supabase.storage.createBucket('post-covers', {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  })

  const bucketStatus =
    bucketError?.message?.includes('already exists')
      ? 'already exists'
      : bucketError ? bucketError.message : 'ok'

  return NextResponse.json({ bucket: bucketStatus })
}
