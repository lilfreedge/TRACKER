-- 019: sample data for the League detail page: only Real Madrid & PSG
-- winners of the UEFA Champions League (as requested by the user).
insert into competition_champions (save_id, competition_name, team_name, team_country, team_color, team_text_color, wins, runners_up, years_won, years_runner_up)
select cs.id, 'UEFA Champions League', x.team, x.country, x.color, x.text_color, x.w, x.rup, x.years_w, x.years_rup
from career_saves cs
cross join (values
  ('REAL MADRID',         'Spain',  '#ffffff', '#1e3a8a', 15, 3, '1956 1957 1958 1959 1960 1966 1998 2000 2002 2014 2016 2017 2018 2022 2024', '1962 1964 1981'),
  ('PARIS SAINT-GERMAIN', 'France', '#0b1e5b', '#dc2626',  2, 1, '2025 2026',                                                                  '2020')
) x(team, country, color, text_color, w, rup, years_w, years_rup)
on conflict do nothing;
