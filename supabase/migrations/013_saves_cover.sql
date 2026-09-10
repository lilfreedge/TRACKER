-- 013: cover_url on career_saves
alter table career_saves add column if not exists cover_url text;
