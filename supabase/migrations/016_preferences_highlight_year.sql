-- 016: highlight-from-year preference used to visually mark modern seasons
-- inside Competition tables (e.g. FC 27 launch year and onwards).
create table if not exists preferences (
  key text primary key,
  value text,
  updated_at timestamptz default now()
);
alter table preferences enable row level security;
drop policy if exists preferences_all on preferences;
create policy preferences_all on preferences for all using (true) with check (true);
insert into preferences (key, value) values ('highlight_from_year', '2026')
  on conflict (key) do nothing;
