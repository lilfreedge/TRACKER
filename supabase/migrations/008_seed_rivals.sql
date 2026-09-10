do $$
declare v_save_id uuid;
begin
  select id into v_save_id from career_saves where name='ARSEN-LEVER-DEPOR' and owner_email='felipetorreira2@gmail.com';
  if v_save_id is null then return; end if;
  insert into rivals (save_id, rival_team, rival_country, rival_color, notes) values
    (v_save_id,'FC BARCELONA','SPAIN','#A50044','logo:https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_Barcelona_%28crest%29.svg/300px-FC_Barcelona_%28crest%29.svg.png'),
    (v_save_id,'REAL MADRID','SPAIN','#FEBE10','logo:https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/300px-Real_Madrid_CF.svg.png'),
    (v_save_id,'MANCHESTER CITY','ENGLAND','#6CABDD','logo:https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/e/eb/Manchester_City_FC_badge.svg/300px-Manchester_City_FC_badge.svg.png'),
    (v_save_id,'INTER MIAMI CF','USA','#F7B5CD','logo:https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/5/5c/Inter_Miami_CF_logo.svg/300px-Inter_Miami_CF_logo.svg.png')
  on conflict do nothing;
end $$;
