-- 014: game_type on games catalog
alter table games add column if not exists game_type text not null default 'eafc';
-- Backfill any existing rows
update games set game_type = 'eafc' where game_type is null or game_type = '';
