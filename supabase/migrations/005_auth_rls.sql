-- ============================================================
-- Enable per-user isolation via Supabase Auth + RLS.
-- Every table is filtered by the JWT email matching owner_email
-- (directly on career_saves, transitively via joins on child tables).
--
-- After this runs, unauthenticated requests see nothing.
-- Run in Supabase SQL Editor (after 001-004).
-- ============================================================

-- Drop the wide-open MVP policies
drop policy if exists "open all" on career_saves;
drop policy if exists "open all" on seasons;
drop policy if exists "open all" on squad_players;
drop policy if exists "open all" on season_results;
drop policy if exists "open all" on national_squad;
drop policy if exists "open all" on transfers;
drop policy if exists "open all" on injuries;
drop policy if exists "open all" on ex_players;
drop policy if exists "open all" on competition_champions;
drop policy if exists "open all" on photo_uploads;
drop policy if exists "open all" on players;
drop policy if exists "open all" on teams;
drop policy if exists "open all" on competitions;

-- Helper: current user's email from the JWT (or null when unauth'd)
create or replace function auth_email() returns text
language sql stable as $$
  select nullif(current_setting('request.jwt.claims', true)::jsonb ->> 'email', '')
$$;

-- career_saves: filter by owner_email = auth email
create policy "own saves - select" on career_saves for select
  using (owner_email = auth_email());
create policy "own saves - insert" on career_saves for insert
  with check (owner_email = auth_email());
create policy "own saves - update" on career_saves for update
  using (owner_email = auth_email())
  with check (owner_email = auth_email());
create policy "own saves - delete" on career_saves for delete
  using (owner_email = auth_email());

-- Helper: check if a save belongs to me
create or replace function owns_save(p_save_id uuid) returns boolean
language sql stable as $$
  select exists(
    select 1 from career_saves
    where id = p_save_id and owner_email = auth_email()
  )
$$;

-- Helper: check if a season belongs to me (via its save)
create or replace function owns_season(p_season_id uuid) returns boolean
language sql stable as $$
  select exists(
    select 1
    from seasons se
    join career_saves cs on cs.id = se.save_id
    where se.id = p_season_id and cs.owner_email = auth_email()
  )
$$;

-- Tables scoped by save_id
create policy "own seasons - all" on seasons for all
  using (owns_save(save_id))
  with check (owns_save(save_id));

create policy "own champions - all" on competition_champions for all
  using (owns_save(save_id))
  with check (owns_save(save_id));

-- Tables scoped by season_id
create policy "own squad - all" on squad_players for all
  using (owns_season(season_id))
  with check (owns_season(season_id));

create policy "own results - all" on season_results for all
  using (owns_season(season_id))
  with check (owns_season(season_id));

create policy "own national - all" on national_squad for all
  using (owns_season(season_id))
  with check (owns_season(season_id));

create policy "own transfers - all" on transfers for all
  using (owns_season(season_id))
  with check (owns_season(season_id));

create policy "own injuries - all" on injuries for all
  using (owns_season(season_id))
  with check (owns_season(season_id));

create policy "own expl - all" on ex_players for all
  using (owns_season(season_id))
  with check (owns_season(season_id));

-- Photo uploads keyed by owner_email
create policy "own photos - all" on photo_uploads for all
  using (owner_email = auth_email())
  with check (owner_email = auth_email());

-- Catalog tables: readable by any authenticated user, write also allowed
-- (used for player photos, team crests, etc. — global lookup)
create policy "catalog players - read" on players for select using (auth_email() is not null);
create policy "catalog players - write" on players for insert with check (auth_email() is not null);
create policy "catalog players - update" on players for update
  using (auth_email() is not null) with check (auth_email() is not null);

create policy "catalog teams - read" on teams for select using (auth_email() is not null);
create policy "catalog teams - write" on teams for insert with check (auth_email() is not null);
create policy "catalog teams - update" on teams for update
  using (auth_email() is not null) with check (auth_email() is not null);

create policy "catalog competitions - read" on competitions for select using (auth_email() is not null);
create policy "catalog competitions - write" on competitions for insert with check (auth_email() is not null);
create policy "catalog competitions - update" on competitions for update
  using (auth_email() is not null) with check (auth_email() is not null);
