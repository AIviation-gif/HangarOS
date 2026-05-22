# HangarOS — Aantekeningen

## Beslissingen
- Stack: Next.js App Router + TypeScript + Tailwind + shadcn/ui + Supabase
- Auth via Supabase (e-mail + wachtwoord)
- Multi-tenant via `club_id` op elke tabel (RLS)
- Middleware → proxy.ts (Next.js 16 breaking change)
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (nieuw formaat sleutel)

## TODO
- [x] Supabase-project aanmaken en URL/key in `.env.local` zetten
- [x] SQL-datamodel uitvoeren in Supabase SQL Editor
- [x] `create_club_and_profile` RPC aanmaken in Supabase
- [x] Deployen op Vercel + GitHub
- [x] Auth flow (register + login)
- [x] Dashboard-layout met sidebar
- [x] Dashboard stats (vliegtuigen / vluchten / open reserveringen)
- [x] Vliegtuigenbeheer (CRUD)
- [x] Vluchtenlogboek (CRUD)
- [x] Reserveringen (CRUD)
- [x] Ledenbeheer (overzicht + bewerken)
- [x] Instellingen (eigen profiel bewerken)

## Supabase
- Project URL: https://biijudfrsisyaukcjdaa.supabase.co
- Dashboard: https://supabase.com/dashboard/project/biijudfrsisyaukcjdaa

## Vercel
- URL: https://hangar-os-chi.vercel.app
- Repo: https://github.com/AIviation-gif/HangarOS
