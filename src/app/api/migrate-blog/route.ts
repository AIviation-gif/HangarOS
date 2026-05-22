import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const PROJECT_REF  = 'biijudfrsisyaukcjdaa'
const SUPABASE_URL = `https://${PROJECT_REF}.supabase.co`

const SQL = `
create table if not exists posts (
  id               uuid primary key default gen_random_uuid(),
  club_id          uuid not null references clubs(id) on delete cascade,
  author_id        uuid not null references profiles(id) on delete cascade,
  title            text not null,
  content          text not null,
  cover_image_url  text,
  status           text not null default 'draft' check (status in ('draft', 'published')),
  published_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table posts enable row level security;

drop policy if exists "read posts"   on posts;
drop policy if exists "insert posts" on posts;
drop policy if exists "update posts" on posts;
drop policy if exists "delete posts" on posts;

create policy "read posts" on posts for select using (
  club_id = get_my_club_id()
  and (status = 'published' or author_id = auth.uid())
);

create policy "insert posts" on posts for insert with check (
  club_id = get_my_club_id()
  and author_id = auth.uid()
);

create policy "update posts" on posts for update using (
  club_id = get_my_club_id()
  and (
    author_id = auth.uid()
    or exists (
      select 1 from profiles where id = auth.uid() and role in ('admin', 'instructeur')
    )
  )
);

create policy "delete posts" on posts for delete using (
  club_id = get_my_club_id()
  and (
    author_id = auth.uid()
    or exists (
      select 1 from profiles where id = auth.uid() and role in ('admin', 'instructeur')
    )
  )
);
`

export async function GET() {
  const mgmtToken = process.env.SUPABASE_MANAGEMENT_TOKEN
  if (!mgmtToken) {
    return NextResponse.json({ error: 'SUPABASE_MANAGEMENT_TOKEN ontbreekt in Vercel env vars.' }, { status: 500 })
  }

  // Run SQL via Management API
  const sqlRes = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${mgmtToken}`,
    },
    body: JSON.stringify({ query: SQL }),
  })
  const sqlBody = await sqlRes.json()
  if (!sqlRes.ok) {
    return NextResponse.json({ sql: 'error', detail: sqlBody }, { status: 500 })
  }

  // Create storage bucket for cover images
  const supabase = createClient(
    SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
  const { error: bucketError } = await supabase.storage.createBucket('post-covers', {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  })
  const bucketStatus =
    bucketError?.message?.includes('already exists')
      ? 'already exists'
      : bucketError ? bucketError.message : 'ok'

  return NextResponse.json({ sql: 'ok', bucket: bucketStatus })
}
