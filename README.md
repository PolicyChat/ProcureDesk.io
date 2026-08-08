# ProcureDesk.io — Marketing Site

Fractional procurement for small business. Next.js 14 (App Router) + Tailwind CSS.

## Quick start

```bash
npm install
cp .env.example .env.local   # fill in Supabase keys when ready
npm run dev                  # http://localhost:3000
```

The site builds and runs WITHOUT Supabase configured — form submissions log to
the server console until env vars are set.

## Supabase setup

Create a `leads` table:

```sql
create table leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text not null,
  phone text default '',
  segment text not null,
  annual_spend_band text not null,
  source_cta text default 'direct',
  created_at timestamptz default now()
);
alter table leads enable row level security;
create policy "service inserts" on leads for insert with check (true);
```

Then set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`.

## Stripe

Paid-tier buttons point at `#stripe-helpdesk` placeholders. Create Stripe
Payment Links and swap the hrefs in `lib/content.ts`.

## Editing copy

ALL site copy lives in `lib/content.ts`. Components contain no hardcoded strings.
To rebrand, change `BRAND` and `DOMAIN` at the top of that file.

## Structure

- `app/` — pages: `/`, `/pricing`, `/vendors`, `/free-analysis`, `api/leads`
- `components/` — Nav, Footer, Hero, Sections, Faq, LeadForm, CtaButton, MobileCta
- `lib/content.ts` — all copy and pricing
- `lib/supabase.ts` — stubbed client (null until env vars set)
