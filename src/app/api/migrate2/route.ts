import { NextResponse } from 'next/server'

const SQL = `
create or replace function sync_aircraft_hours()
returns trigger
language plpgsql
security definer
as $$
declare
  v_dur     numeric;
  v_old_dur numeric;
begin
  if tg_op = 'INSERT' then
    v_dur := greatest(0, extract(epoch from (new.arrival_time - new.departure_time)) / 3600);
    update aircraft set total_hours = total_hours + v_dur where id = new.aircraft_id;
    return new;
  end if;

  if tg_op = 'UPDATE' then
    v_old_dur := greatest(0, extract(epoch from (old.arrival_time - old.departure_time)) / 3600);
    v_dur     := greatest(0, extract(epoch from (new.arrival_time - new.departure_time)) / 3600);
    if old.aircraft_id = new.aircraft_id then
      update aircraft set total_hours = total_hours - v_old_dur + v_dur where id = new.aircraft_id;
    else
      update aircraft set total_hours = greatest(0, total_hours - v_old_dur) where id = old.aircraft_id;
      update aircraft set total_hours = total_hours + v_dur where id = new.aircraft_id;
    end if;
    return new;
  end if;

  if tg_op = 'DELETE' then
    v_old_dur := greatest(0, extract(epoch from (old.arrival_time - old.departure_time)) / 3600);
    update aircraft set total_hours = greatest(0, total_hours - v_old_dur) where id = old.aircraft_id;
    return old;
  end if;
end;
$$;

drop trigger if exists trg_flights_sync_hours on flights;
create trigger trg_flights_sync_hours
  after insert or update or delete on flights
  for each row execute function sync_aircraft_hours();
`

export async function GET() {
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY
  const mgmtToken = process.env.SUPABASE_MANAGEMENT_TOKEN

  if (!mgmtToken) return NextResponse.json({ error: 'SUPABASE_MANAGEMENT_TOKEN ontbreekt.' }, { status: 500 })

  try {
    const res = await fetch('https://api.supabase.com/v1/projects/biijudfrsisyaukcjdaa/database/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${mgmtToken}` },
      body: JSON.stringify({ query: SQL }),
    })
    const body = await res.json()
    if (!res.ok) return NextResponse.json({ error: body }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}
