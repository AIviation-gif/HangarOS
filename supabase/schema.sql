-- ============================================================
-- HangarOS — datamodel
-- Uitvoeren in: Supabase SQL Editor
-- ============================================================

-- ============================================================
-- CLUBS (tenant-root)
-- ============================================================
create table clubs (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text not null unique,           -- gebruikt in URL later
  created_at timestamptz not null default now()
);

-- ============================================================
-- PROFILES (verlengstuk van auth.users, één per gebruiker)
-- ============================================================
create type member_role as enum ('admin', 'instructeur', 'lid');

create table profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  club_id        uuid not null references clubs(id) on delete cascade,
  full_name      text not null default '',
  role           member_role not null default 'lid',
  license_number text,
  phone          text,
  created_at     timestamptz not null default now()
);

-- ============================================================
-- AIRCRAFT (vliegtuigen in de hangar)
-- ============================================================
create type aircraft_status as enum ('beschikbaar', 'onderhoud', 'gereserveerd');

create table aircraft (
  id           uuid primary key default gen_random_uuid(),
  club_id      uuid not null references clubs(id) on delete cascade,
  registration text not null,       -- bijv. PH-ABC
  type         text not null,       -- bijv. Cessna 172
  total_hours  numeric(8,1) not null default 0,
  status       aircraft_status not null default 'beschikbaar',
  created_at   timestamptz not null default now(),
  unique (club_id, registration)
);

-- ============================================================
-- FLIGHTS (vluchtenlogboek)
-- ============================================================
create table flights (
  id             uuid primary key default gen_random_uuid(),
  club_id        uuid not null references clubs(id) on delete cascade,
  aircraft_id    uuid not null references aircraft(id),
  pilot_id       uuid not null references profiles(id),
  instructor_id  uuid references profiles(id),  -- null bij solovlucht
  date           date not null,
  departure_time time not null,
  arrival_time   time not null,
  from_icao      text not null,                 -- bijv. EHRD
  to_icao        text not null,
  landings       smallint not null default 1,
  remarks        text,
  created_at     timestamptz not null default now()
);

-- ============================================================
-- RESERVATIONS (vliegtuigboekingen)
-- ============================================================
create type reservation_status as enum ('aangevraagd', 'bevestigd', 'geannuleerd');

create table reservations (
  id          uuid primary key default gen_random_uuid(),
  club_id     uuid not null references clubs(id) on delete cascade,
  aircraft_id uuid not null references aircraft(id),
  member_id   uuid not null references profiles(id),
  starts_at   timestamptz not null,
  ends_at     timestamptz not null,
  status      reservation_status not null default 'aangevraagd',
  created_at  timestamptz not null default now(),
  check (ends_at > starts_at)
);

-- ============================================================
-- INDEXES
-- ============================================================
create index on profiles     (club_id);
create index on aircraft     (club_id);
create index on flights      (club_id, date desc);
create index on flights      (pilot_id);
create index on reservations (club_id, starts_at);
create index on reservations (aircraft_id, starts_at);

-- ============================================================
-- RLS — helper functie (voorkomt oneindige recursie)
-- ============================================================
create or replace function get_my_club_id()
returns uuid
language sql
security definer stable
as $$
  select club_id from profiles where id = auth.uid()
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table clubs        enable row level security;
alter table profiles     enable row level security;
alter table aircraft     enable row level security;
alter table flights      enable row level security;
alter table reservations enable row level security;

-- Clubs: een lid mag zijn eigen club lezen
create policy "clubs: eigen club lezen"
  on clubs for select
  using (id = get_my_club_id());

-- Profiles: leden van dezelfde club zien elkaars profiel
create policy "profiles: eigen club"
  on profiles for all
  using (club_id = get_my_club_id());

-- Aircraft: leden van dezelfde club
create policy "aircraft: eigen club"
  on aircraft for all
  using (club_id = get_my_club_id());

-- Flights: leden van dezelfde club
create policy "flights: eigen club"
  on flights for all
  using (club_id = get_my_club_id());

-- Reservations: leden van dezelfde club
create policy "reservations: eigen club"
  on reservations for all
  using (club_id = get_my_club_id());
