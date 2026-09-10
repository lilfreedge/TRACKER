alter table seasons
  add column if not exists club_since_year int,
  add column if not exists national_team text,
  add column if not exists national_team_color text,
  add column if not exists national_team_text_color text,
  add column if not exists national_team_since_year int,
  add column if not exists notes_previous_summary jsonb;
alter table squad_players
  add column if not exists market_value numeric,
  add column if not exists market_value_currency text default 'EUR',
  add column if not exists benched_reason text;
alter table players
  add column if not exists height_cm int,
  add column if not exists pref_foot text,
  add column if not exists photo_source text;

create table if not exists manager_profiles (id uuid primary key default uuid_generate_v4(), owner_email text not null, display_name text, nickname text, photo_url text, career_started_year int, nationality text, bio text, created_at timestamptz default now(), updated_at timestamptz default now());
create unique index if not exists idx_manager_owner on manager_profiles(owner_email);

create table if not exists rivals (id uuid primary key default uuid_generate_v4(), save_id uuid references career_saves(id) on delete cascade, rival_team text not null, rival_country text, rival_color text, notes text, created_at timestamptz default now());
create index if not exists idx_rivals_save on rivals(save_id);

create table if not exists matches (id uuid primary key default uuid_generate_v4(), save_id uuid references career_saves(id) on delete cascade, season_id uuid references seasons(id) on delete set null, rival_id uuid references rivals(id) on delete set null, match_date text, competition text, venue text, home_team text, away_team text, home_goals int, away_goals int, result text, scorers text, notes text, created_at timestamptz default now());
create index if not exists idx_matches_save on matches(save_id);
create index if not exists idx_matches_rival on matches(rival_id);

create table if not exists season_objectives (id uuid primary key default uuid_generate_v4(), season_id uuid references seasons(id) on delete cascade, title text not null, achieved boolean, notes text, created_at timestamptz default now());
create table if not exists awards (id uuid primary key default uuid_generate_v4(), season_id uuid references seasons(id) on delete cascade, award_type text not null, competition text, winner_name text not null, team text, created_at timestamptz default now());
create table if not exists season_photos (id uuid primary key default uuid_generate_v4(), season_id uuid references seasons(id) on delete cascade, storage_path text not null, caption text, created_at timestamptz default now());

alter table manager_profiles enable row level security;
alter table rivals enable row level security;
alter table matches enable row level security;
alter table season_objectives enable row level security;
alter table awards enable row level security;
alter table season_photos enable row level security;
create policy "open all" on manager_profiles for all using (true) with check (true);
create policy "open all" on rivals for all using (true) with check (true);
create policy "open all" on matches for all using (true) with check (true);
create policy "open all" on season_objectives for all using (true) with check (true);
create policy "open all" on awards for all using (true) with check (true);
create policy "open all" on season_photos for all using (true) with check (true);
insert into storage.buckets (id, name, public) values ('manager-photos','manager-photos',true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('season-photos','season-photos',true) on conflict (id) do nothing;
