# HangarOS — Aantekeningen

## Beslissingen
- Stack: Next.js App Router + TypeScript + Tailwind + shadcn/ui + Supabase
- Auth via Supabase (e-mail + wachtwoord)
- Multi-tenant via `club_id` op elke tabel (RLS later)

## TODO
- [x] Supabase-project aanmaken en URL/key in `.env.local` zetten
- [x] SQL-datamodel uitvoeren in Supabase SQL Editor
- [x] Deployen op Vercel
- [ ] Dashboard-layout bouwen
- [ ] Vliegtuigenbeheer (CRUD)
- [ ] Vluchtenlogboek
- [ ] Reserveringen

## Supabase
- Project URL: https://biijudfrsisyaukcjdaa.supabase.co
- Dashboard: https://supabase.com/dashboard/project/biijudfrsisyaukcjdaa

## Vercel
- URL: https://hangar-os-chi.vercel.app
- Repo: https://github.com/AIviation-gif/HangarOS
