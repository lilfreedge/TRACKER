-- 015: per-save leagues catalog for the Competition page
create table if not exists save_competitions (
  id uuid primary key default gen_random_uuid(),
  save_id uuid not null references career_saves(id) on delete cascade,
  name text not null,
  logo_url text,
  hidden boolean default false,
  sort_order int default 0,
  created_at timestamptz default now(),
  unique(save_id, name)
);
alter table save_competitions enable row level security;
drop policy if exists save_competitions_all on save_competitions;
create policy save_competitions_all on save_competitions for all using (true) with check (true);

-- Seed the 6 default leagues into every existing save
insert into save_competitions (save_id, name, logo_url, sort_order)
select cs.id, x.name, x.logo, x.ord
from career_saves cs
cross join (values
  ('UEFA Champions League', 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/b/bf/UEFA_Champions_League_logo_2.svg/220px-UEFA_Champions_League_logo_2.svg.png', 1),
  ('UEFA Europa League',    'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/d/d8/UEFA_Europa_League_logo_2024.svg/220px-UEFA_Europa_League_logo_2024.svg.png',    2),
  ('UEFA Conference League','https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/8/8f/UEFA_Conference_League.svg/220px-UEFA_Conference_League.svg.png',              3),
  ('La Liga',               'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/9/92/LaLiga.svg/220px-LaLiga.svg.png',                                              4),
  ('Premier League',        'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/f/f2/Premier_League_Logo.svg/220px-Premier_League_Logo.svg.png',                    5),
  ('Bundesliga',            'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/d/df/Bundesliga_logo_%282017%29.svg/220px-Bundesliga_logo_%282017%29.svg.png',      6)
) x(name, logo, ord)
on conflict (save_id, name) do nothing;
