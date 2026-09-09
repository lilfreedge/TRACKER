-- ============================================================
-- Seed 4 rivals on ARSEN-LEVER-DEPOR save.
-- Logos use FUT.gg CDN (may need to be replaced if URL changes).
-- ============================================================
do $$
declare v_save_id uuid;
begin
  select id into v_save_id from career_saves
  where name = 'ARSEN-LEVER-DEPOR' and owner_email = 'felipetorreira2@gmail.com';

  if v_save_id is null then return; end if;

  -- Insert rivals (skip if already exists)
  insert into rivals (save_id, rival_team, rival_country, rival_color, notes)
  values
    (v_save_id, 'FC BARCELONA',       'SPAIN',   '#A50044', 'logo:https://upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_Barcelona_%28crest%29.svg/1200px-FC_Barcelona_%28crest%29.svg.png'),
    (v_save_id, 'REAL MADRID',        'SPAIN',   '#FEBE10', 'logo:https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/1200px-Real_Madrid_CF.svg.png'),
    (v_save_id, 'MANCHESTER CITY',    'ENGLAND', '#6CABDD', 'logo:https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Manchester_City_FC_badge.svg/1200px-Manchester_City_FC_badge.svg.png'),
    (v_save_id, 'INTER MIAMI CF',     'USA',     '#F7B5CD', 'logo:https://upload.wikimedia.org/wikipedia/en/thumb/5/5c/Inter_Miami_CF_logo.svg/1200px-Inter_Miami_CF_logo.svg.png')
  on conflict do nothing;
end $$;
