-- RecoveryPath — MVP schema (Supabase / Postgres)
--
-- Two halves:
--   1. Legal content (the State Remedy Knowledge Graph + Evidence Graph) — written by staff, read by the engine.
--   2. User case data (the Financial Harm Graph) — written by users, protected by row-level security.
--
-- The MVP app currently runs its rules from lib/content/*.ts and stores cases in the browser.
-- This schema is the target for moving both server-side (accounts, saved cases, attorney sharing,
-- Recovery Tracker, outcome intelligence). Column names mirror lib/types.ts.

create extension if not exists pgcrypto;

-- =========================================================================
-- 1. LEGAL CONTENT
-- =========================================================================

create type rule_status as enum ('draft', 'legal_review', 'approved', 'published', 'retired');

create table remedies (
  id text primary key,                         -- 'coerced_debt'
  name text not null,
  short_name text not null,
  user_label text not null,
  summary text not null,
  created_at timestamptz default now()
);

create table official_sources (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('statute','case','agency','regulation','court')),
  title text not null,
  citation text,
  url text,
  last_checked date
);

create table agencies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  purpose text not null,
  url text,
  phone text,
  state text                                   -- null = federal / national
);

create table forms (
  id uuid primary key default gen_random_uuid(),
  state text,
  agency_id uuid references agencies(id),
  name text not null,
  form_number text,
  url text,
  fee_cents int,
  fee_notes text
);

-- One row per state × remedy module.
create table state_remedies (
  id text primary key,                         -- 'CA.coerced_debt'
  state text not null,                         -- 'CA' … or 'US' for the federal fallback
  remedy_id text not null references remedies(id),
  current_version int,
  unique (state, remedy_id)
);

-- Immutable versions. Never UPDATE a published row: insert a new version.
create table legal_rule_versions (
  id uuid primary key default gen_random_uuid(),
  state_remedy_id text not null references state_remedies(id),
  version int not null,
  status rule_status not null default 'draft',
  title text not null,
  effective_date date,
  last_verified date,
  trigger jsonb not null,                      -- Condition tree (lib/types.ts Condition)
  signals jsonb not null default '[]',
  info_needed jsonb not null default '[]',
  urgency jsonb not null default '[]',
  state_notes jsonb not null default '[]',
  requirements jsonb not null default '[]',
  procedure jsonb not null default '[]',
  deadlines jsonb not null default '[]',       -- each {label, description, verified}
  professional_review_at numeric,
  change_note text not null,
  created_by uuid,
  created_at timestamptz default now(),
  unique (state_remedy_id, version)
);

-- Published versions are frozen.
create or replace function prevent_published_edit() returns trigger language plpgsql as $$
begin
  if old.status in ('published','retired') and (new.trigger, new.signals, new.state_notes, new.requirements, new.procedure, new.deadlines)
       is distinct from (old.trigger, old.signals, old.state_notes, old.requirements, old.procedure, old.deadlines) then
    raise exception 'Published rule versions are immutable; create a new version';
  end if;
  return new;
end $$;
create trigger legal_rule_versions_immutable before update on legal_rule_versions
  for each row execute function prevent_published_edit();

create table eligibility_rules (               -- normalized view of trigger leaves, for analytics/search
  id uuid primary key default gen_random_uuid(),
  rule_version_id uuid not null references legal_rule_versions(id) on delete cascade,
  role text not null check (role in ('trigger','signal','urgency','info_needed')),
  label text
);
create table rule_conditions (
  id uuid primary key default gen_random_uuid(),
  eligibility_rule_id uuid not null references eligibility_rules(id) on delete cascade,
  fact text not null,
  op text not null,
  value jsonb
);
create table exceptions (
  id uuid primary key default gen_random_uuid(),
  rule_version_id uuid not null references legal_rule_versions(id) on delete cascade,
  description text not null,
  condition jsonb
);

create table rule_version_sources (
  rule_version_id uuid references legal_rule_versions(id) on delete cascade,
  source_id uuid references official_sources(id),
  primary key (rule_version_id, source_id)
);
create table rule_version_agencies (
  rule_version_id uuid references legal_rule_versions(id) on delete cascade,
  agency_id uuid references agencies(id),
  primary key (rule_version_id, agency_id)
);

create table attorney_reviews (
  id uuid primary key default gen_random_uuid(),
  rule_version_id uuid not null references legal_rule_versions(id),
  reviewer_name text not null,
  reviewer_bar_number text,
  reviewer_state text,
  decision text not null check (decision in ('approved','changes_requested','rejected')),
  notes text,
  reviewed_at timestamptz default now()
);

-- Evidence Graph: remedy → element → evidence → source → acquisition method
create table evidence_requirements (
  id text not null,                            -- 'credit_report'
  remedy_id text not null references remedies(id),
  state_remedy_id text references state_remedies(id),   -- null = applies in every state
  label text not null,
  supports text not null,                      -- legal element / requirement supported
  why text not null,
  where_to_get text not null,
  weight smallint not null check (weight between 1 and 3),
  primary key (remedy_id, id)
);

create table actions (                         -- action library
  id text primary key,
  remedy_id text references remedies(id),
  bucket text not null check (bucket in ('do_first','next','then','after','professional','lower')),
  condition jsonb,
  evidence_id text,
  states text[],
  title text not null,
  detail text not null
);

-- =========================================================================
-- 2. USER CASE DATA (RLS-protected)
-- =========================================================================

create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  neutral_notifications boolean not null default true,
  research_consent boolean not null default false     -- Outcome Intelligence: opt-in only
);

create table cases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  state text,
  answers jsonb not null default '{}',
  entitlement text not null default 'free' check (entitlement in ('free','plan','passport')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table relationships (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  relationship_type text,
  status text,
  started_on date,
  ended_on date
);

create table incidents (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  occurred_on date,
  description text
);

-- Financial Harm Graph
create table financial_events (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  incident_id uuid references incidents(id),
  category text not null,
  description text,
  amount_cents bigint not null check (amount_cents >= 0),
  occurred_on date,
  evidence_strength text not null check (evidence_strength in ('strong','moderate','weak','none')),
  resolution text not null default 'unresolved' check (resolution in ('unresolved','disputed','attorney_review','resolved')),
  resolved_amount_cents bigint
);
create table debts (
  financial_event_id uuid primary key references financial_events(id) on delete cascade,
  creditor text, current_owner text, secured boolean, on_credit_report boolean, in_collections boolean
);
create table assets (
  financial_event_id uuid primary key references financial_events(id) on delete cascade,
  asset_type text, titled_to text, estimated_value_cents bigint
);
create table shared_obligations (
  financial_event_id uuid primary key references financial_events(id) on delete cascade,
  obligation_type text, user_role text, partner_kept_asset boolean, payments_missed boolean
);

create table case_matches (                    -- engine output snapshot, with the exact rule version used
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  rule_version_id uuid references legal_rule_versions(id),
  remedy_id text not null,
  strength text not null,
  why jsonb not null,
  computed_at timestamptz default now()
);

create table user_evidence (
  case_id uuid not null references cases(id) on delete cascade,
  remedy_id text not null,
  evidence_id text not null,
  status text not null check (status in ('have','requested','not_requested','unavailable')),
  updated_at timestamptz default now(),
  primary key (case_id, remedy_id, evidence_id)
);

create table documents (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  storage_path text,                           -- Supabase Storage (private bucket); null = kept on device
  file_name text not null,
  mime_type text,
  size_bytes bigint,
  evidence_key text,                           -- 'coerced_debt:credit_report'
  ai_suggested_key text,                       -- suggestion only; user confirms
  created_at timestamptz default now()
);

create table case_actions (
  case_id uuid not null references cases(id) on delete cascade,
  action_id text not null,
  status text not null check (status in ('todo','in_progress','done')),
  updated_at timestamptz default now(),
  primary key (case_id, action_id)
);

create table reports (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  kind text not null check (kind in ('claim_readiness')),
  snapshot jsonb not null,
  created_at timestamptz default now()
);

create table case_passports (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  format text not null,                        -- 'recoverypath.case-passport/0.1'
  payload jsonb not null,
  created_at timestamptz default now()
);

-- Separate, explicit consent before anything is shared with an attorney.
create table attorney_share_consents (
  id uuid primary key default gen_random_uuid(),
  case_passport_id uuid not null references case_passports(id) on delete cascade,
  recipient text not null,
  consented_at timestamptz default now(),
  revoked_at timestamptz
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  case_id uuid references cases(id) on delete set null,
  stripe_session_id text unique not null,
  plan text not null,
  amount_cents int not null,
  status text not null,
  created_at timestamptz default now()
);

-- Anonymous funnel analytics: no user id, no amounts, no free text.
create table analytics_events (
  id bigint generated always as identity primary key,
  name text not null,
  props jsonb not null default '{}',
  created_at timestamptz default now()
);

create table audit_logs (
  id bigint generated always as identity primary key,
  actor uuid,
  action text not null,
  entity text not null,
  entity_id text,
  detail jsonb,
  created_at timestamptz default now()
);

-- -------------------------------------------------------------------------
-- Row-level security
-- -------------------------------------------------------------------------
alter table users enable row level security;
alter table cases enable row level security;
alter table relationships enable row level security;
alter table incidents enable row level security;
alter table financial_events enable row level security;
alter table debts enable row level security;
alter table assets enable row level security;
alter table shared_obligations enable row level security;
alter table case_matches enable row level security;
alter table user_evidence enable row level security;
alter table documents enable row level security;
alter table case_actions enable row level security;
alter table reports enable row level security;
alter table case_passports enable row level security;
alter table attorney_share_consents enable row level security;
alter table payments enable row level security;
alter table analytics_events enable row level security;   -- service role only
alter table audit_logs enable row level security;         -- service role only

create policy "own profile" on users for all using (id = auth.uid()) with check (id = auth.uid());
create policy "own cases" on cases for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create or replace function owns_case(cid uuid) returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from cases where id = cid and user_id = auth.uid());
$$;

create policy "own" on relationships for all using (owns_case(case_id)) with check (owns_case(case_id));
create policy "own" on incidents for all using (owns_case(case_id)) with check (owns_case(case_id));
create policy "own" on financial_events for all using (owns_case(case_id)) with check (owns_case(case_id));
create policy "own" on case_matches for select using (owns_case(case_id));
create policy "own" on user_evidence for all using (owns_case(case_id)) with check (owns_case(case_id));
create policy "own" on documents for all using (owns_case(case_id)) with check (owns_case(case_id));
create policy "own" on case_actions for all using (owns_case(case_id)) with check (owns_case(case_id));
create policy "own" on reports for select using (owns_case(case_id));
create policy "own" on case_passports for select using (owns_case(case_id));
create policy "own" on payments for select using (user_id = auth.uid());
create policy "own" on debts for all using (owns_case((select case_id from financial_events where id = financial_event_id)));
create policy "own" on assets for all using (owns_case((select case_id from financial_events where id = financial_event_id)));
create policy "own" on shared_obligations for all using (owns_case((select case_id from financial_events where id = financial_event_id)));
create policy "own" on attorney_share_consents for all using (owns_case((select case_id from case_passports where id = case_passport_id)));

-- Legal content is world-readable once published; writes via service role / admin only.
alter table legal_rule_versions enable row level security;
create policy "read published" on legal_rule_versions for select using (status = 'published');
