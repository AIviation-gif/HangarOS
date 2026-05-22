-- ============================================================
-- HangarOS — database functies
-- Uitvoeren in: Supabase SQL Editor (na schema.sql)
-- ============================================================

-- Maakt atomisch een club + admin-profiel aan na registratie.
-- SECURITY DEFINER = draait als de DB-eigenaar, omzeilt RLS.
create or replace function create_club_and_profile(
  p_club_name text,
  p_club_slug text,
  p_full_name text
)
returns void
language plpgsql
security definer
as $$
declare
  v_club_id uuid;
begin
  -- Alleen de ingelogde gebruiker mag dit aanroepen
  if auth.uid() is null then
    raise exception 'Niet ingelogd';
  end if;

  -- Maak de club aan
  insert into clubs (name, slug)
  values (p_club_name, p_club_slug)
  returning id into v_club_id;

  -- Maak het profiel aan als admin
  insert into profiles (id, club_id, full_name, role)
  values (auth.uid(), v_club_id, p_full_name, 'admin');
end;
$$;
