alter table squad_players
  add column if not exists salary_amount numeric,
  add column if not exists salary_currency text default 'EUR',
  add column if not exists salary_period text default 'week',
  add column if not exists contract_ends int,
  add column if not exists salary_notes text;
alter table ex_players
  add column if not exists last_salary_amount numeric,
  add column if not exists last_salary_currency text default 'EUR',
  add column if not exists last_salary_period text default 'week';
drop view if exists player_salary_history;
create view player_salary_history as
select sp.name_snapshot as player_name, se.save_id as save_id, se.label as season_label, se.team_name_snapshot as team, sp.role::text as role, sp.ovr, sp.salary_amount as amount, sp.salary_currency as currency, sp.salary_period as period, sp.contract_ends, sp.salary_notes as notes, 'squad'::text as source, sp.created_at
from squad_players sp join seasons se on se.id=sp.season_id where sp.salary_amount is not null
union all
select ep.player_name, se.save_id, se.label, ep.current_team, 'ex'::text, ep.ovr, ep.last_salary_amount, ep.last_salary_currency, ep.last_salary_period, null::int, null::text, 'ex_players'::text, ep.created_at
from ex_players ep join seasons se on se.id=ep.season_id where ep.last_salary_amount is not null;
