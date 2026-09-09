-- ============================================================
-- Seed historical seasons for ARSEN-LEVER-DEPOR:
-- 25-30 Depor · 33-36 Arsenal · 36 Aug-Dec Brighton · 36-37 Feb Napoli
-- ============================================================

do $$
declare
  v_save_id uuid;
begin
  select id into v_save_id from career_saves
  where name = 'ARSEN-LEVER-DEPOR' and owner_email = 'felipetorreira2@gmail.com';
  if v_save_id is null then return; end if;

  -- Helper to insert a season if it doesn't already exist
  insert into seasons (save_id, label, team_name_snapshot, team_color, team_text_color, formation, start_date, club_since_year, is_current, sort_order)
  select v_save_id, '2025-2026', 'RC Deportivo La Coruña', '#00529F', '#FFFFFF', '4-3-3', '2025-07', 2025, false, 10
  where not exists (select 1 from seasons where save_id = v_save_id and label = '2025-2026');

  insert into seasons (save_id, label, team_name_snapshot, team_color, team_text_color, formation, start_date, club_since_year, is_current, sort_order)
  select v_save_id, '2026-2027', 'RC Deportivo La Coruña', '#00529F', '#FFFFFF', '4-3-3', '2026-07', 2025, false, 20
  where not exists (select 1 from seasons where save_id = v_save_id and label = '2026-2027');

  insert into seasons (save_id, label, team_name_snapshot, team_color, team_text_color, formation, start_date, club_since_year, is_current, sort_order)
  select v_save_id, '2027-2028', 'RC Deportivo La Coruña', '#00529F', '#FFFFFF', '4-3-3', '2027-07', 2025, false, 30
  where not exists (select 1 from seasons where save_id = v_save_id and label = '2027-2028');

  insert into seasons (save_id, label, team_name_snapshot, team_color, team_text_color, formation, start_date, club_since_year, is_current, sort_order)
  select v_save_id, '2028-2029', 'RC Deportivo La Coruña', '#00529F', '#FFFFFF', '4-3-3', '2028-07', 2025, false, 40
  where not exists (select 1 from seasons where save_id = v_save_id and label = '2028-2029');

  insert into seasons (save_id, label, team_name_snapshot, team_color, team_text_color, formation, start_date, club_since_year, is_current, sort_order)
  select v_save_id, '2029-2030', 'RC Deportivo La Coruña', '#00529F', '#FFFFFF', '4-3-3', '2029-07', 2025, false, 50
  where not exists (select 1 from seasons where save_id = v_save_id and label = '2029-2030');

  insert into seasons (save_id, label, team_name_snapshot, team_color, team_text_color, formation, start_date, club_since_year, is_current, sort_order)
  select v_save_id, '2033-2034', 'Arsenal', '#EF0107', '#FFFFFF', '4-3-3', '2033-07', 2033, false, 60
  where not exists (select 1 from seasons where save_id = v_save_id and label = '2033-2034');

  insert into seasons (save_id, label, team_name_snapshot, team_color, team_text_color, formation, start_date, club_since_year, is_current, sort_order)
  select v_save_id, '2034-2035', 'Arsenal', '#EF0107', '#FFFFFF', '4-3-3', '2034-07', 2033, false, 70
  where not exists (select 1 from seasons where save_id = v_save_id and label = '2034-2035');

  insert into seasons (save_id, label, team_name_snapshot, team_color, team_text_color, formation, start_date, club_since_year, is_current, sort_order)
  select v_save_id, '2035-2036', 'Arsenal', '#EF0107', '#FFFFFF', '4-3-3', '2035-07', 2033, false, 80
  where not exists (select 1 from seasons where save_id = v_save_id and label = '2035-2036');

  insert into seasons (save_id, label, team_name_snapshot, team_color, team_text_color, formation, start_date, end_date, club_since_year, is_current, notes, sort_order)
  select v_save_id, '2036-2037 (Brighton)', 'Brighton', '#0057B8', '#FFFFFF', '4-3-3', '2036-08', '2036-12', 2036, false, 'Aug-Dec 2036', 90
  where not exists (select 1 from seasons where save_id = v_save_id and label = '2036-2037 (Brighton)');

  insert into seasons (save_id, label, team_name_snapshot, team_color, team_text_color, formation, start_date, end_date, club_since_year, is_current, notes, sort_order)
  select v_save_id, '2036-2037 (Napoli)', 'SSC Napoli', '#12A0D7', '#FFFFFF', '4-1-2-1-2', '2037-02', '2037-06', 2037, false, 'Feb-Jun 2037', 100
  where not exists (select 1 from seasons where save_id = v_save_id and label = '2036-2037 (Napoli)');

  -- Also give 2037-2038 the ordering key
  update seasons set sort_order = 110 where save_id = v_save_id and label = '2037-2038';

  raise notice 'Historical seasons seeded.';
end $$;

-- ============================================================
-- Basic championships history (COMPETITION tab excerpt)
-- ============================================================
do $$
declare v_save_id uuid;
begin
  select id into v_save_id from career_saves
  where name = 'ARSEN-LEVER-DEPOR' and owner_email = 'felipetorreira2@gmail.com';
  if v_save_id is null then return; end if;

  insert into competition_champions (save_id, competition_name, team_name, team_country, wins, runners_up, years_won, years_runner_up) values
  (v_save_id, 'PREMIER LEAGUE',       'ARSENAL',         'ENGLAND', 4, 3, '27 31 35 36',   '26 29 34'),
  (v_save_id, 'PREMIER LEAGUE',       'LIVERPOOL',       'ENGLAND', 2, 4, '30 34',         '27 33 35 36'),
  (v_save_id, 'PREMIER LEAGUE',       'MANCHESTER CITY', 'ENGLAND', 3, 2, '26 32 33',      '28 30'),
  (v_save_id, 'UEFA CHAMPIONS LEAGUE','ARSENAL',         'ENGLAND', 3, 2, '34 35 36',      '31'),
  (v_save_id, 'UEFA CHAMPIONS LEAGUE','RC DEPORTIVO',    'SPAIN',   3, 0, '27 28 29',      null),
  (v_save_id, 'UEFA CHAMPIONS LEAGUE','MANCHESTER CITY', 'ENGLAND', 2, 1, '26',            null),
  (v_save_id, 'UEFA CHAMPIONS LEAGUE','PARIS SG',        'FRANCE',  2, 1, '31 32',         null),
  (v_save_id, 'LA LIGA',              'RC DEPORTIVO',    'SPAIN',   2, 0, '29 30',         null),
  (v_save_id, 'LA LIGA',              'FC BARCELONA',    'SPAIN',   4, 3, '26 27 28 32 33','30 31 35'),
  (v_save_id, 'COPA DEL REY',         'RC DEPORTIVO',    'SPAIN',   3, 0, '26 29 30',      null),
  (v_save_id, 'WORLD CUP',            'ENGLAND',         'ENGLAND', 1, 0, '26',            null),
  (v_save_id, 'WORLD CUP',            'SPAIN',           'SPAIN',   1, 1, '34',            null),
  (v_save_id, 'EURO CUP',             'FRANCE',          'FRANCE',  1, 0, '36',            null)
  on conflict do nothing;
end $$;
