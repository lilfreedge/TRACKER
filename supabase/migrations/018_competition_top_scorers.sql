-- 018: historical top scorers per competition (independent of app seasons)
create table if not exists competition_top_scorers (
  id uuid primary key default gen_random_uuid(),
  save_id uuid not null references career_saves(id) on delete cascade,
  competition_name text not null,
  player_name text not null,
  nationality text,
  goals int not null,
  season_label text not null,
  team_name text,
  team_color text,
  team_text_color text,
  nationality_color text,
  created_at timestamptz default now()
);
create index if not exists cts_save_comp on competition_top_scorers(save_id, competition_name);
alter table competition_top_scorers enable row level security;
drop policy if exists cts_all on competition_top_scorers;
create policy cts_all on competition_top_scorers for all using (true) with check (true);
