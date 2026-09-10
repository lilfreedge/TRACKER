-- 017: country on save_competitions + seed for the default leagues
alter table save_competitions add column if not exists country text;
update save_competitions set country = 'England'  where name = 'Premier League' and country is null;
update save_competitions set country = 'Spain'    where name = 'La Liga' and country is null;
update save_competitions set country = 'Germany'  where name = 'Bundesliga' and country is null;
update save_competitions set country = 'Europe'   where name in ('UEFA Champions League','UEFA Europa League','UEFA Conference League') and country is null;
