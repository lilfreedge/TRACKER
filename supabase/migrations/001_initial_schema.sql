-- ============================================================
-- CAREER TRACKER - Initial schema
-- Run this in Supabase SQL Editor (Project → SQL Editor → New query)
-- ============================================================

-- Enable useful extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- CATALOGS (shared across saves)
-- ============================================================

-- Players catalog (reused across saves)
create table if not exists players (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  nationality text,
  birth_year int,
  photo_url text,             -- resolved from FUT.gg / external
  external_id text,           -- e.g. FUT.gg id
  created_at timestamptz default now()
);

-- Teams catalog
create table if not exists teams (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  country text,
  primary_color text,          -- hex, for team header
  text_color text,             -- hex, contrast for the header
  crest_url text,
  created_at timestamptz default now()
);

-- Competitions catalog
create table if not exists competitions (
  id uuid primary key default uuid_generate_v4(),
  name text not null,          -- Premier League, UCL, FA Cup, etc.
  country text,                -- ENGLAND, EUROPE, WORLD, etc.
  type text                    -- league / cup / continental / national
);

-- ============================================================
-- CAREER SAVES (multi-partida)
-- ============================================================
create table if not exists career_saves (
  id uuid primary key default uuid_generate_v4(),
  owner_email text not null,   -- felipetorreira2@gmail.com, for filtering
  name text not null,          -- ARSEN-LEVER-DEPOR
  notes text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ============================================================
-- SEASONS per save
-- ============================================================
create table if not exists seasons (
  id uuid primary key default uuid_generate_v4(),
  save_id uuid references career_saves(id) on delete cascade,
  label text not null,         -- "2037-2038" or "37-38"
  team_id uuid references teams(id),
  team_name_snapshot text,     -- e.g. "MANCHESTER UNITED"
  team_color text,             -- hex, denormalized so ui works fast
  team_text_color text,
  formation text,              -- "4-3-3"
  start_date text,             -- "2037-08"
  end_date text,               -- if user changed team mid-season
  is_current boolean default false,
  notes text,
  created_at timestamptz default now()
);
create index if not exists idx_seasons_save on seasons(save_id);

-- ============================================================
-- SQUAD (players per season with their season-specific data)
-- ============================================================
create type squad_role as enum ('starting', 'bench', 'reserve', 'loaned');

create table if not exists squad_players (
  id uuid primary key default uuid_generate_v4(),
  season_id uuid references seasons(id) on delete cascade,
  player_id uuid references players(id),
  -- snapshot of key info (for fast display + resilience if catalog changes)
  name_snapshot text not null,
  jersey int,
  position text,               -- LW / ST / RW / CAM / CM / CDM / LB / CB / RB / GK
  age int,
  ovr int,
  nationality_snapshot text,
  since_year int,              -- year they joined the club
  role squad_role default 'starting',
  formation_slot int,          -- 1-11 for order in the XI
  canterano_status text,       -- C.1, C.2, C.SUB, or null
  photo_url text,
  notes text,
  created_at timestamptz default now()
);
create index if not exists idx_squad_season on squad_players(season_id);
create index if not exists idx_squad_role on squad_players(season_id, role);

-- ============================================================
-- TITLES / RESULTS per season
-- ============================================================
create table if not exists season_results (
  id uuid primary key default uuid_generate_v4(),
  season_id uuid references seasons(id) on delete cascade,
  competition_id uuid references competitions(id),
  competition_name_snapshot text not null,
  result text,                 -- winner / runner_up / round_of_16 / semis / quarter / group_stage / not_qualified
  opponent text,
  score text,
  notes text,
  created_at timestamptz default now()
);

-- ============================================================
-- NATIONAL TEAM SQUAD (when user's players get called up)
-- ============================================================
create table if not exists national_squad (
  id uuid primary key default uuid_generate_v4(),
  season_id uuid references seasons(id) on delete cascade,
  country text not null,       -- FRANCE, SPAIN, etc.
  intl_label text,             -- "M FRANCE INTL 2037"
  player_name text not null,
  club text,
  jersey int,
  position text,
  age int,
  ovr int,
  called_since int,
  club_since int,
  note text,                   -- called_back, new_sub, etc.
  role squad_role default 'starting',
  created_at timestamptz default now()
);
create index if not exists idx_national_season on national_squad(season_id);

-- ============================================================
-- TRANSFERS in/out during the season
-- ============================================================
create table if not exists transfers (
  id uuid primary key default uuid_generate_v4(),
  season_id uuid references seasons(id) on delete cascade,
  player_name text not null,
  direction text,              -- in / out
  from_team text,
  to_team text,
  amount text,                 -- freeform "150MM" or "loan"
  transfer_type text,          -- bought / sold / upgrade / downgrade / loan_in / loan_out
  note text,
  created_at timestamptz default now()
);

-- ============================================================
-- INJURIES
-- ============================================================
create table if not exists injuries (
  id uuid primary key default uuid_generate_v4(),
  season_id uuid references seasons(id) on delete cascade,
  player_name text not null,
  injury_type text,            -- ACL, muscle, etc.
  duration text,
  replaced_by text,
  note text,
  date text,
  created_at timestamptz default now()
);

-- ============================================================
-- EX-PLAYERS (career-long history of who has left)
-- ============================================================
create table if not exists ex_players (
  id uuid primary key default uuid_generate_v4(),
  season_id uuid references seasons(id) on delete cascade,
  player_name text not null,
  position text,
  ovr int,
  current_team text,           -- where they are now
  value text,
  seasons_played int,
  year_gone int,
  created_at timestamptz default now()
);

-- ============================================================
-- COMPETITION CHAMPIONS (the COMPETITION tab — includes real-world historical + user's career)
-- ============================================================
create table if not exists competition_champions (
  id uuid primary key default uuid_generate_v4(),
  save_id uuid references career_saves(id) on delete cascade,
  competition_name text not null,
  team_name text not null,
  team_country text,
  wins int default 0,
  runners_up int default 0,
  years_won text,              -- comma-separated "27 31 35 36"
  years_runner_up text,
  created_at timestamptz default now()
);
create index if not exists idx_champions_save on competition_champions(save_id);

-- ============================================================
-- PHOTO UPLOADS (history of screenshots + IA extraction)
-- ============================================================
create table if not exists photo_uploads (
  id uuid primary key default uuid_generate_v4(),
  owner_email text not null,
  storage_path text not null,   -- path in supabase storage
  extracted_json jsonb,         -- output of IA vision
  linked_squad_player_id uuid references squad_players(id),
  created_at timestamptz default now()
);

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
insert into storage.buckets (id, name, public)
values ('player-photos', 'player-photos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('screenshots', 'screenshots', false)
on conflict (id) do nothing;

-- ============================================================
-- ROW LEVEL SECURITY (simple: filter by owner_email, single user for now)
-- Since it's single-user for now, we'll enable RLS and open policies.
-- ============================================================
alter table career_saves enable row level security;
alter table seasons enable row level security;
alter table squad_players enable row level security;
alter table season_results enable row level security;
alter table national_squad enable row level security;
alter table transfers enable row level security;
alter table injuries enable row level security;
alter table ex_players enable row level security;
alter table competition_champions enable row level security;
alter table photo_uploads enable row level security;
alter table players enable row level security;
alter table teams enable row level security;
alter table competitions enable row level security;

-- Open policies for MVP (single user). Tighten later with auth.uid()
create policy "open all" on career_saves for all using (true) with check (true);
create policy "open all" on seasons for all using (true) with check (true);
create policy "open all" on squad_players for all using (true) with check (true);
create policy "open all" on season_results for all using (true) with check (true);
create policy "open all" on national_squad for all using (true) with check (true);
create policy "open all" on transfers for all using (true) with check (true);
create policy "open all" on injuries for all using (true) with check (true);
create policy "open all" on ex_players for all using (true) with check (true);
create policy "open all" on competition_champions for all using (true) with check (true);
create policy "open all" on photo_uploads for all using (true) with check (true);
create policy "open all" on players for all using (true) with check (true);
create policy "open all" on teams for all using (true) with check (true);
create policy "open all" on competitions for all using (true) with check (true);
