-- ============================================================
-- v1.3 schema — reorder, contracts, team catalog.
-- Also defensively restores "open all" RLS on career_saves in
-- case migration 005 (parked for v2) was accidentally applied.
-- ============================================================

-- Restore open RLS on career_saves (defensive; harmless if already open)
drop policy if exists "own saves - select" on career_saves;
drop policy if exists "own saves - insert" on career_saves;
drop policy if exists "own saves - update" on career_saves;
drop policy if exists "own saves - delete" on career_saves;
drop policy if exists "open all"           on career_saves;
create policy "open all" on career_saves for all using (true) with check (true);

drop policy if exists "own seasons - all" on seasons;
drop policy if exists "open all"          on seasons;
create policy "open all" on seasons for all using (true) with check (true);

drop policy if exists "own squad - all"  on squad_players;
drop policy if exists "open all"         on squad_players;
create policy "open all" on squad_players for all using (true) with check (true);

drop policy if exists "own rivals - all" on rivals;
drop policy if exists "open all"         on rivals;
create policy "open all" on rivals for all using (true) with check (true);

drop policy if exists "own matches - all" on matches;
drop policy if exists "open all"          on matches;
create policy "open all" on matches for all using (true) with check (true);

-- Sort order everywhere the user can reorder
alter table career_saves add column if not exists sort_order int default 0;
alter table seasons      add column if not exists sort_order int default 0;
alter table rivals       add column if not exists sort_order int default 0;

-- Preferences per owner (hero-tile order, etc.)
create table if not exists preferences (
  owner_email text primary key,
  tile_order jsonb default '["career","current","competition","rivals"]'::jsonb,
  updated_at timestamptz default now()
);
alter table preferences enable row level security;
drop policy if exists "open all" on preferences;
create policy "open all" on preferences for all using (true) with check (true);

-- Team catalog for autocomplete + colors + crests
create table if not exists team_catalog (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  country text,
  primary_color text,
  text_color text,
  crest_url text,
  aliases text[] default '{}',
  created_at timestamptz default now()
);
create unique index if not exists idx_team_catalog_name on team_catalog(lower(name));
alter table team_catalog enable row level security;
drop policy if exists "open all" on team_catalog;
create policy "open all" on team_catalog for all using (true) with check (true);

-- Contracts (relación temporal entre user y equipo)
create table if not exists contracts (
  id uuid primary key default uuid_generate_v4(),
  save_id uuid references career_saves(id) on delete cascade,
  team_name text not null,
  team_color text,
  team_text_color text,
  team_crest_url text,
  team_catalog_id uuid references team_catalog(id) on delete set null,
  signed_year int,
  signed_month int,          -- 1..12; null = unknown
  monthly_salary numeric,
  monthly_salary_currency text default 'EUR',
  notes text,
  created_at timestamptz default now()
);
create index if not exists idx_contracts_save on contracts(save_id);
alter table contracts enable row level security;
drop policy if exists "open all" on contracts;
create policy "open all" on contracts for all using (true) with check (true);

-- Season may reference a contract (source of team + color)
alter table seasons add column if not exists contract_id uuid references contracts(id) on delete set null;
alter table seasons add column if not exists national_since_month int;  -- 1..12 for Since date
