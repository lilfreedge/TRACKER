alter table career_saves add column if not exists game_edition text not null default 'EAFC 26';
update career_saves set game_edition = 'EAFC 26' where game_edition is null or game_edition = '';
create index if not exists idx_career_saves_game on career_saves(game_edition);
