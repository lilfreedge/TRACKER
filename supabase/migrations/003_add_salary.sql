-- ============================================================
-- Add salary + contract fields to squad_players.
-- Also add same to ex_players for jugadores que ya se fueron.
-- Run in Supabase SQL Editor after 001 and 002.
-- ============================================================

alter table squad_players
  add column if not exists salary_amount numeric,       -- e.g. 120000 (per week/year — you decide)
  add column if not exists salary_currency text default 'EUR',
  add column if not exists salary_period text default 'week',  -- 'week' or 'year'
  add column if not exists contract_ends int,           -- year, e.g. 2041
  add column if not exists salary_notes text;

alter table ex_players
  add column if not exists last_salary_amount numeric,
  add column if not exists last_salary_currency text default 'EUR',
  add column if not exists last_salary_period text default 'week';

-- ============================================================
-- Helper view: full salary history per player name
-- Combines squad_players + ex_players ordered by season.
-- role is cast to text so the union works across enum + literal.
-- ============================================================
drop view if exists player_salary_history;

create view player_salary_history as
select
  sp.name_snapshot           as player_name,
  se.save_id                 as save_id,
  se.label                   as season_label,
  se.team_name_snapshot      as team,
  sp.role::text              as role,
  sp.ovr                     as ovr,
  sp.salary_amount           as amount,
  sp.salary_currency         as currency,
  sp.salary_period           as period,
  sp.contract_ends           as contract_ends,
  sp.salary_notes            as notes,
  'squad'::text              as source,
  sp.created_at              as created_at
from squad_players sp
join seasons se on se.id = sp.season_id
where sp.salary_amount is not null

union all

select
  ep.player_name             as player_name,
  se.save_id                 as save_id,
  se.label                   as season_label,
  ep.current_team            as team,
  'ex'::text                 as role,
  ep.ovr                     as ovr,
  ep.last_salary_amount      as amount,
  ep.last_salary_currency    as currency,
  ep.last_salary_period      as period,
  null::int                  as contract_ends,
  null::text                 as notes,
  'ex_players'::text         as source,
  ep.created_at              as created_at
from ex_players ep
join seasons se on se.id = ep.season_id
where ep.last_salary_amount is not null;
