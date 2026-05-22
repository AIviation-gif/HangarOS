import { NextResponse } from 'next/server'

const SQL = `
alter table aircraft
  add column if not exists inspection_interval numeric default 100,
  add column if not exists hours_at_last_inspection numeric default 0;

create table if not exists defects (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references clubs(id) on delete cascade,
  aircraft_id uuid not null references aircraft(id) on delete cascade,
  reported_by uuid references profiles(id),
  description text not null,
  photo_url text,
  severity text not null default 'normal' check (severity in ('normal','grounding')),
  status text not null default 'open' check (status in ('open','in_progress','resolved')),
  created_at timestamptz default now(),
  resolved_at timestamptz
);

alter table defects enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='defects' and policyname='defects_select') then
    create policy "defects_select" on defects for select using (club_id = get_my_club_id());
  end if;
  if not exists (select 1 from pg_policies where tablename='defects' and policyname='defects_insert') then
    create policy "defects_insert" on defects for insert with check (club_id = get_my_club_id());
  end if;
  if not exists (select 1 from pg_policies where tablename='defects' and policyname='defects_update') then
    create policy "defects_update" on defects for update using (club_id = get_my_club_id());
  end if;
  if not exists (select 1 from pg_policies where tablename='defects' and policyname='defects_delete') then
    create policy "defects_delete" on defects for delete using (club_id = get_my_club_id());
  end if;
end $$;
`

export async function GET() {
  const mgmtToken = process.env.SUPABASE_MANAGEMENT_TOKEN
  const projectRef = 'biijudfrsisyaukcjdaa'

  if (!mgmtToken) {
    return NextResponse.json({ error: 'SUPABASE_MANAGEMENT_TOKEN ontbreekt in Vercel env vars.' }, { status: 500 })
  }

  try {
    const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mgmtToken}`,
      },
      body: JSON.stringify({ query: SQL }),
    })

    const body = await res.json()

    if (!res.ok) {
      return NextResponse.json({ error: body }, { status: 500 })
    }

    return NextResponse.json({ ok: true, result: body })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
