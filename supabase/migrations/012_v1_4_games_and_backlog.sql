-- 012: games catalog + backlog features
-- Games catalog (drag-reorder, cover art)
create table if not exists games (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  cover_url text,
  sort_order int default 0,
  created_at timestamptz default now()
);
alter table games enable row level security;
drop policy if exists games_all on games;
create policy games_all on games for all using (true) with check (true);

-- Seed distinct game editions from career_saves
insert into games (name, sort_order)
select distinct game_edition, 0 from career_saves
where game_edition is not null and game_edition <> ''
on conflict (name) do nothing;

-- Default covers for known editions (Wikipedia via weserv proxy)
update games set cover_url = 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/e/e9/EA_Sports_FC_26_cover.jpg/220px-EA_Sports_FC_26_cover.jpg' where lower(name) in ('eafc 26','eafc26') and cover_url is null;
update games set cover_url = 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/f/f0/EA_Sports_FC_25_cover.jpg/220px-EA_Sports_FC_25_cover.jpg' where lower(name) in ('eafc 25','eafc25') and cover_url is null;

-- Top scorers historical view (aggregates goals from matches by scorer name)
-- matches.scorers is free text; we count occurrences of ; separated names
-- For a real aggregate we use a season_scorers table instead
create table if not exists season_scorers (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references seasons(id) on delete cascade,
  player_name text not null,
  goals int default 0,
  assists int default 0,
  appearances int default 0,
  competition text,
  created_at timestamptz default now()
);
alter table season_scorers enable row level security;
drop policy if exists season_scorers_all on season_scorers;
create policy season_scorers_all on season_scorers for all using (true) with check (true);

-- Ensure open-all RLS on existing v1.2/v1.3 tables (season_objectives, awards, season_photos)
do $$ begin
  if to_regclass('season_objectives') is not null then
    execute 'alter table season_objectives enable row level security';
    execute 'drop policy if exists so_all on season_objectives';
    execute 'create policy so_all on season_objectives for all using (true) with check (true)';
  end if;
  if to_regclass('awards') is not null then
    execute 'alter table awards enable row level security';
    execute 'drop policy if exists aw_all on awards';
    execute 'create policy aw_all on awards for all using (true) with check (true)';
  end if;
  if to_regclass('season_photos') is not null then
    execute 'alter table season_photos enable row level security';
    execute 'drop policy if exists sp_all on season_photos';
    execute 'create policy sp_all on season_photos for all using (true) with check (true)';
  end if;
end $$;

-- Season summary snapshot (final table position + top scorer + note)
create table if not exists season_summaries (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null unique references seasons(id) on delete cascade,
  final_position int,
  points int,
  top_scorer text,
  top_scorer_goals int,
  key_moment text,
  next_objective text,
  created_at timestamptz default now()
);
alter table season_summaries enable row level security;
drop policy if exists ss_all on season_summaries;
create policy ss_all on season_summaries for all using (true) with check (true);
