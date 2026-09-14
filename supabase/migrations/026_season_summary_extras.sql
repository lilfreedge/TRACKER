-- 026: Summary JSON columns for competition finishes + top 8 league standings
alter table season_summaries add column if not exists competition_finishes jsonb default '[]'::jsonb;
alter table season_summaries add column if not exists top8_standings jsonb default '[]'::jsonb;
