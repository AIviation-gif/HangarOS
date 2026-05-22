-- HangarOS — Blog migratie
-- Uitvoeren in: Supabase SQL Editor

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

-- Leden zien gepubliceerde berichten + hun eigen concepten
create policy "read posts" on posts for select using (
  club_id = get_my_club_id()
  and (status = 'published' or author_id = auth.uid())
);

-- Elk lid mag berichten aanmaken
create policy "insert posts" on posts for insert with check (
  club_id = get_my_club_id()
  and author_id = auth.uid()
);

-- Auteur of manager mag bewerken
create policy "update posts" on posts for update using (
  club_id = get_my_club_id()
  and (
    author_id = auth.uid()
    or exists (
      select 1 from profiles where id = auth.uid() and role in ('admin', 'instructeur')
    )
  )
);

-- Auteur of manager mag verwijderen
create policy "delete posts" on posts for delete using (
  club_id = get_my_club_id()
  and (
    author_id = auth.uid()
    or exists (
      select 1 from profiles where id = auth.uid() and role in ('admin', 'instructeur')
    )
  )
);
