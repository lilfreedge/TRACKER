-- ============================================================
-- SEED: ARSEN-LEVER-DEPOR save + season 2037-2038 Manchester United
-- Run this in Supabase SQL Editor. Idempotent (safe to run twice
-- because we check existing save name first).
-- ============================================================

do $$
declare
  v_save_id uuid;
  v_season_id uuid;
begin
  -- Create the save if it doesn't already exist
  select id into v_save_id
  from career_saves
  where owner_email = 'felipetorreira2@gmail.com'
    and name = 'ARSEN-LEVER-DEPOR';

  if v_save_id is null then
    insert into career_saves (owner_email, name, notes)
    values ('felipetorreira2@gmail.com', 'ARSEN-LEVER-DEPOR', 'Imported from Google Sheet')
    returning id into v_save_id;
  end if;

  -- Create the season if not exists
  select id into v_season_id
  from seasons
  where save_id = v_save_id and label = '2037-2038';

  if v_season_id is null then
    insert into seasons (
      save_id, label, team_name_snapshot, team_color, team_text_color,
      formation, start_date, is_current
    )
    values (
      v_save_id, '2037-2038', 'MANCHESTER UNITED', '#DA291C', '#FBE122',
      '4-3-3', '2037-08', true
    )
    returning id into v_season_id;
  end if;

  -- Clean and reinsert players for this season
  delete from squad_players where season_id = v_season_id;

  -- Titulares (11)
  insert into squad_players (season_id, name_snapshot, position, ovr, age, nationality_snapshot, role, formation_slot, jersey)
  values
    (v_season_id, 'IBRAHIM MBAYE',  'LW',  85,   30,   'FRANCE',   'starting',  1,  null),
    (v_season_id, 'SEŠKO',          'ST',  87,   null, 'SLOVAKIA', 'starting',  2,  null),
    (v_season_id, 'YERAY VARELA',   'RW',  84,   null, null,       'starting',  3,  null),
    (v_season_id, 'MOLEIRO',        'CAM', 86,   29,   'SPAIN',    'starting',  4,  null),
    (v_season_id, 'AMAD',           'CAM', 83,   null, null,       'starting',  5,  null),
    (v_season_id, 'MAINOO',         'CM',  null, null, null,       'starting',  6,  null),
    (v_season_id, 'CAS FRANÇOIS',   'LB',  88,   21,   'BELGIUM',  'starting',  7,  2),
    (v_season_id, 'ARCE',           'CB',  79,   null, null,       'starting',  8,  null),
    (v_season_id, 'MOURIÑO',        'CB',  84,   null, null,       'starting',  9,  null),
    (v_season_id, 'BURNETT',        'RB',  65,   null, null,       'starting',  10, null),
    (v_season_id, 'SENNE LAMMENS',  'GK',  87,   30,   'BELGIUM',  'starting',  11, 1);

  -- Bench (8)
  insert into squad_players (season_id, name_snapshot, position, ovr, role)
  values
    (v_season_id, 'CUNHA',          'CAM', 78, 'bench'),
    (v_season_id, 'MOORHOUSE',      'CAM', 69, 'bench'),
    (v_season_id, 'LEROUX',         'CM',  78, 'bench'),
    (v_season_id, 'OYEDELE',        'CDM', 81, 'bench'),
    (v_season_id, 'VITINHA',        'CM',  79, 'bench'),
    (v_season_id, 'THOMASSEN',      'CDM', 79, 'bench'),
    (v_season_id, 'ALUKO',          'LB',  79, 'bench'),
    (v_season_id, 'FREDRICSON',     'CB',  80, 'bench');

  raise notice 'Seed complete. save_id=%, season_id=%', v_save_id, v_season_id;
end $$;
