-- 024: expand competitions + Ligue 1 champions + UCL top scorers +
--       Coupe de France, Trophée des Champions, UEFA Super Cup, World Cup, Euro Cup

-- Add missing leagues to every save
insert into save_competitions (save_id, name, logo_url, country, sort_order)
select cs.id, x.name, x.logo, x.country, x.ord
from career_saves cs
cross join (values
  ('Ligue 1',                   'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/9/98/Ligue1_2024_Logo.svg/1200px-Ligue1_2024_Logo.svg.png',                       'France', 4),
  ('Coupe de France',           'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/1/1a/Coupe_de_France_logo.svg/1200px-Coupe_de_France_logo.svg.png',              'France', 20),
  ('Trophée des Champions',     null,                                                                                                                                                    'France', 21),
  ('UEFA Super Cup',            'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/e/eb/UEFA_Super_Cup.svg/1200px-UEFA_Super_Cup.svg.png',                          null,     22),
  ('FIFA World Cup',            'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/e/e9/2026_FIFA_World_Cup.svg/1200px-2026_FIFA_World_Cup.svg.png',                null,     23),
  ('UEFA European Championship',null,                                                                                                                                                    null,     24)
) x(name, logo, country, ord)
on conflict (save_id, name) do nothing;

-- ==========================================
-- Ligue 1 — historical champions
-- ==========================================
insert into competition_champions (save_id, competition_name, team_name, team_country, team_color, team_text_color, wins, runners_up, years_won, years_runner_up)
select cs.id, 'Ligue 1', x.team, 'France', x.color, x.text_color, x.w, x.rup, x.years_w, x.years_rup
from career_saves cs
cross join (values
  ('SAINT-ÉTIENNE',         '#008a3c', '#ffffff', 10, 3, '1957 1964 1967 1968 1969 1970 1974 1975 1976 1981', '1946 1962 1982'),
  ('PARIS SAINT-GERMAIN',   '#0b1e5b', '#dc2626', 12, 8, '1986 1994 2013 2014 2015 2016 2018 2019 2020 2022 2023 2024', '1989 1993 1996 2000 2004 2012 2017 2021'),
  ('OLYMPIQUE MARSEILLE',   '#009de0', '#ffffff', 9,  12, '1937 1948 1971 1972 1989 1990 1991 1992 2010',       '1938 1970 1975 1987 1994 1999 2007 2009 2011 2013 2020 2022'),
  ('OLYMPIQUE LYONNAIS',    '#ffffff', '#e40e2a', 7,  3, '2002 2003 2004 2005 2006 2007 2008',                  '1995 2015 2016'),
  ('AS MONACO',             '#e30613', '#ffffff', 8,  6, '1961 1963 1978 1982 1988 1997 2000 2017',             '1964 1984 1991 1992 2003 2018'),
  ('FC NANTES',             '#fff100', '#008a52', 8,  7, '1965 1966 1973 1977 1980 1983 1995 2001',             '1967 1974 1978 1979 1981 1985 1986'),
  ('STADE DE REIMS',        '#e30613', '#ffffff', 6,  3, '1949 1953 1955 1958 1960 1962',                       '1947 1954 1963'),
  ('LILLE OSC',             '#e30613', '#ffffff', 4,  4, '1946 1954 2011 2021',                                 '1949 1950 1951 2005'),
  ('BORDEAUX',              '#000080', '#ffffff', 6,  8, '1950 1984 1985 1987 1999 2009',                       '1952 1965 1966 1969 1983 1988 1990 2008')
) x(team, color, text_color, w, rup, years_w, years_rup)
on conflict do nothing;

-- ==========================================
-- Coupe de France — headline winners
-- ==========================================
insert into competition_champions (save_id, competition_name, team_name, team_country, team_color, team_text_color, wins, runners_up, years_won, years_runner_up)
select cs.id, 'Coupe de France', x.team, 'France', x.color, x.text_color, x.w, x.rup, x.years_w, x.years_rup
from career_saves cs
cross join (values
  ('PARIS SAINT-GERMAIN','#0b1e5b','#dc2626', 15, 3, '1982 1983 1993 1995 1998 2004 2006 2010 2015 2016 2017 2018 2020 2021 2024', '1985 2003 2011'),
  ('OLYMPIQUE MARSEILLE','#009de0','#ffffff',10, 5, '1924 1926 1927 1935 1938 1943 1969 1972 1976 1989',                              '1934 1940 1954 1986 1991'),
  ('AS MONACO',          '#e30613','#ffffff', 5, 5, '1960 1963 1980 1985 1991',                                                       '1974 1984 1989 2010 2021'),
  ('OLYMPIQUE LYONNAIS', '#ffffff','#e40e2a', 5, 5, '1964 1967 1973 2008 2012',                                                       '1963 1971 1976 2007 2020')
) x(team, color, text_color, w, rup, years_w, years_rup)
on conflict do nothing;

-- ==========================================
-- Trophée des Champions
-- ==========================================
insert into competition_champions (save_id, competition_name, team_name, team_country, team_color, team_text_color, wins, runners_up, years_won, years_runner_up)
select cs.id, 'Trophée des Champions', x.team, 'France', x.color, x.text_color, x.w, x.rup, x.years_w, x.years_rup
from career_saves cs
cross join (values
  ('PARIS SAINT-GERMAIN','#0b1e5b','#dc2626',13, 2, '1995 1998 2013 2014 2015 2016 2017 2018 2019 2020 2022 2023 2024', '2000 2004'),
  ('OLYMPIQUE MARSEILLE','#009de0','#ffffff', 3, 3, '1971 2010 2011',                                                    '1972 1988 2012'),
  ('OLYMPIQUE LYONNAIS', '#ffffff','#e40e2a', 8, 2, '1973 2002 2003 2004 2005 2006 2007 2012',                            '2001 2008')
) x(team, color, text_color, w, rup, years_w, years_rup)
on conflict do nothing;

-- ==========================================
-- UEFA Super Cup — top winners
-- ==========================================
insert into competition_champions (save_id, competition_name, team_name, team_country, team_color, team_text_color, wins, runners_up, years_won, years_runner_up)
select cs.id, 'UEFA Super Cup', x.team, x.country, x.color, x.text_color, x.w, x.rup, x.years_w, x.years_rup
from career_saves cs
cross join (values
  ('REAL MADRID',        'Spain',   '#ffffff','#1e3a8a', 6, 4, '2002 2014 2016 2017 2022 2024', '1998 2000 2018 2023'),
  ('FC BARCELONA',       'Spain',   '#004d98','#a50044', 5, 4, '1992 1997 2009 2011 2015',      '1979 1982 2006 2020'),
  ('AC MILAN',           'Italy',   '#fb090b','#000000', 5, 2, '1989 1990 1994 2003 2007',      '1993 1995'),
  ('LIVERPOOL',          'England', '#c8102e','#ffffff', 4, 3, '1977 2001 2005 2019',           '1978 1981 1984'),
  ('BAYERN MUNICH',      'Germany', '#dc052d','#ffffff', 2, 4, '2013 2020',                     '1975 1976 2001 2013')
) x(team, country, color, text_color, w, rup, years_w, years_rup)
on conflict do nothing;

-- ==========================================
-- World Cup
-- ==========================================
insert into competition_champions (save_id, competition_name, team_name, team_country, team_color, team_text_color, wins, runners_up, years_won, years_runner_up)
select cs.id, 'FIFA World Cup', x.team, x.country, x.color, x.text_color, x.w, x.rup, x.years_w, x.years_rup
from career_saves cs
cross join (values
  ('BRAZIL',       'Brazil',       '#fedd00','#009c3b', 5, 2, '1958 1962 1970 1994 2002', '1950 1998'),
  ('GERMANY',      'Germany',      '#000000','#ffe600', 4, 4, '1954 1974 1990 2014',      '1966 1982 1986 2002'),
  ('ITALY',        'Italy',        '#0055a4','#ffffff', 4, 2, '1934 1938 1982 2006',      '1970 1994'),
  ('ARGENTINA',    'Argentina',    '#75aadb','#ffffff', 3, 3, '1978 1986 2022',           '1930 1990 2014'),
  ('FRANCE',       'France',       '#0055a4','#ffffff', 2, 2, '1998 2018',                '2006 2022'),
  ('URUGUAY',      'Uruguay',      '#75aadb','#ffffff', 2, 0, '1930 1950',                ''),
  ('SPAIN',        'Spain',        '#c8102e','#fdb913', 1, 0, '2010',                     ''),
  ('ENGLAND',      'England',      '#ffffff','#0055a4', 1, 1, '1966',                     '2020')
) x(team, country, color, text_color, w, rup, years_w, years_rup)
on conflict do nothing;

-- ==========================================
-- UEFA Champions League top scorers in one season (historical)
-- ==========================================
insert into competition_top_scorers (save_id, competition_name, player_name, nationality, goals, season_label, team_name, team_color, team_text_color, nationality_color)
select cs.id, 'UEFA Champions League', x.player, x.nat, x.goals, x.season, x.team, x.team_color, x.text_color, x.nat_color
from career_saves cs
cross join (values
  ('CRISTIANO RONALDO', 'PORTUGAL',   17, '2013-2014', 'REAL MADRID',   '#ffffff','#1e3a8a','#c8102e'),
  ('CRISTIANO RONALDO', 'PORTUGAL',   17, '2015-2016', 'REAL MADRID',   '#ffffff','#1e3a8a','#c8102e'),
  ('LIONEL MESSI',      'ARGENTINA',  14, '2011-2012', 'FC BARCELONA',  '#004d98','#a50044','#75aadb'),
  ('CRISTIANO RONALDO', 'PORTUGAL',   16, '2015-2016', 'REAL MADRID',   '#ffffff','#1e3a8a','#c8102e'),
  ('ROBERT LEWANDOWSKI','POLAND',     15, '2019-2020', 'BAYERN MUNICH', '#dc052d','#ffffff','#c8102e'),
  ('KYLIAN MBAPPÉ',     'FRANCE',     12, '2023-2024', 'PSG',           '#0b1e5b','#dc2626','#0055a4'),
  ('ERLING HAALAND',    'NORWAY',     12, '2022-2023', 'MANCHESTER CITY','#6cabdd','#ffffff','#c8102e'),
  ('KARIM BENZEMA',     'FRANCE',     15, '2021-2022', 'REAL MADRID',   '#ffffff','#1e3a8a','#0055a4'),
  ('LIONEL MESSI',      'ARGENTINA',  12, '2018-2019', 'FC BARCELONA',  '#004d98','#a50044','#75aadb'),
  ('RUUD VAN NISTELROOY','NETHERLANDS',12, '2002-2003', 'MANCHESTER UNITED','#da291c','#ffe500','#f36c21')
) x(player, nat, goals, season, team, team_color, text_color, nat_color)
on conflict do nothing;

-- ==========================================
-- Ligue 1 top scorers in one season
-- ==========================================
insert into competition_top_scorers (save_id, competition_name, player_name, nationality, goals, season_label, team_name, team_color, team_text_color, nationality_color)
select cs.id, 'Ligue 1', x.player, x.nat, x.goals, x.season, x.team, x.team_color, x.text_color, x.nat_color
from career_saves cs
cross join (values
  ('KYLIAN MBAPPÉ',      'FRANCE',    27, '2018-2019', 'PARIS SAINT-GERMAIN', '#0b1e5b','#dc2626','#0055a4'),
  ('KYLIAN MBAPPÉ',      'FRANCE',    28, '2021-2022', 'PARIS SAINT-GERMAIN', '#0b1e5b','#dc2626','#0055a4'),
  ('KYLIAN MBAPPÉ',      'FRANCE',    27, '2022-2023', 'PARIS SAINT-GERMAIN', '#0b1e5b','#dc2626','#0055a4'),
  ('KYLIAN MBAPPÉ',      'FRANCE',    27, '2023-2024', 'PARIS SAINT-GERMAIN', '#0b1e5b','#dc2626','#0055a4'),
  ('EDINSON CAVANI',     'URUGUAY',   35, '2016-2017', 'PARIS SAINT-GERMAIN', '#0b1e5b','#dc2626','#75aadb'),
  ('ZLATAN IBRAHIMOVIĆ', 'SWEDEN',    38, '2015-2016', 'PARIS SAINT-GERMAIN', '#0b1e5b','#dc2626','#fecc00'),
  ('CARLOS BIANCHI',     'ARGENTINA', 37, '1977-1978', 'STADE DE REIMS',      '#e30613','#ffffff','#75aadb'),
  ('JOSIP SKOBLAR',      'YUGOSLAVIA',44, '1970-1971', 'OLYMPIQUE MARSEILLE', '#009de0','#ffffff','#c8102e'),
  ('DELIO ONNIS',        'ARGENTINA', 30, '1975-1976', 'AS MONACO',           '#e30613','#ffffff','#75aadb'),
  ('JEAN-PIERRE PAPIN',  'FRANCE',    30, '1989-1990', 'OLYMPIQUE MARSEILLE', '#009de0','#ffffff','#0055a4')
) x(player, nat, goals, season, team, team_color, text_color, nat_color)
on conflict do nothing;
