-- 016: highlight-from-year setting used to visually mark modern seasons
-- inside Competition tables (e.g. FC 27 launch year and onwards).
--
-- Uses its own `app_settings` table to avoid colliding with an existing
-- `preferences` table from an earlier migration.
create table if not exists app_settings (
  key text primary key,
  value text,
  updated_at timestamptz default now()
);
alter table app_settings enable row level security;
drop policy if exists app_settings_all on app_settings;
create policy app_settings_all on app_settings for all using (true) with check (true);
insert into app_settings (key, value) values ('highlight_from_year', '2026')
  on conflict (key) do nothing;
