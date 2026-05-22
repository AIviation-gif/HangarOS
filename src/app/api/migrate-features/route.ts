import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const PROJECT_REF  = 'biijudfrsisyaukcjdaa'
const SUPABASE_URL = `https://${PROJECT_REF}.supabase.co`

const SQL = `
-- Bevoegdheden op profielen
alter table profiles
  add column if not exists medical_expiry  date,
  add column if not exists license_expiry  date,
  add column if not exists ratings         text;

-- Uurtarief op vliegtuigen
alter table aircraft
  add column if not exists hourly_rate numeric(8,2) default 0;

-- Kosten + betaalstatus op vluchten
alter table flights
  add column if not exists cost   numeric(8,2),
  add column if not exists paid   boolean not null default false;

-- Documenten tabel
create table if not exists documents (
  id           uuid primary key default gen_random_uuid(),
  club_id      uuid not null references clubs(id) on delete cascade,
  name         text not null,
  file_url     text not null,
  category     text not null check (category in ('aircraft', 'member', 'club')),
  aircraft_id  uuid references aircraft(id) on delete cascade,
  member_id    uuid references profiles(id) on delete cascade,
  uploaded_by  uuid references profiles(id),
  created_at   timestamptz not null default now()
);

alter table documents enable row level security;

drop policy if exists "documents_select" on documents;
drop policy if exists "documents_insert" on documents;
drop policy if exists "documents_delete" on documents;

create policy "documents_select" on documents for select
  using (club_id = get_my_club_id());

create policy "documents_insert" on documents for insert
  with check (club_id = get_my_club_id());

create policy "documents_delete" on documents for delete
  using (
    club_id = get_my_club_id()
    and (
      uploaded_by = auth.uid()
      or exists (
        select 1 from profiles where id = auth.uid() and role in ('admin', 'instructeur')
      )
    )
  );
`

export async function GET() {
  const mgmtToken = process.env.SUPABASE_MANAGEMENT_TOKEN
  if (!mgmtToken) {
    return NextResponse.json({ error: 'SUPABASE_MANAGEMENT_TOKEN ontbreekt' }, { status: 500 })
  }

  const sqlRes = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${mgmtToken}` },
    body: JSON.stringify({ query: SQL }),
  })
  const sqlBody = await sqlRes.json()
  if (!sqlRes.ok) return NextResponse.json({ sql: 'error', detail: sqlBody }, { status: 500 })

  // Documents storage bucket
  const supabase = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const { error: bucketErr } = await supabase.storage.createBucket('documents', {
    public: false,
    fileSizeLimit: 20 * 1024 * 1024,
  })
  const bucket = bucketErr?.message?.includes('already exists') ? 'already exists'
    : bucketErr ? bucketErr.message : 'ok'

  return NextResponse.json({ sql: 'ok', bucket })
}
