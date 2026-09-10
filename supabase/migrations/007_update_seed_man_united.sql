do $$
declare v_season_id uuid;
begin
  select se.id into v_season_id from seasons se join career_saves cs on cs.id=se.save_id where cs.name='ARSEN-LEVER-DEPOR' and se.label='2037-2038';
  if v_season_id is null then return; end if;
  update seasons set club_since_year=2037 where id=v_season_id;
  update squad_players set jersey=7,age=20,nationality_snapshot='FRANCE',since_year=2035 where season_id=v_season_id and name_snapshot='IBRAHIM MBAYE';
  update squad_players set jersey=30,age=24,nationality_snapshot='SLOVENIA',since_year=2025 where season_id=v_season_id and name_snapshot='SEŠKO';
  update squad_players set jersey=11,age=22,nationality_snapshot='SPAIN',since_year=2028 where season_id=v_season_id and name_snapshot='YERAY VARELA';
  update squad_players set jersey=10,age=29,nationality_snapshot='SPAIN',since_year=2035 where season_id=v_season_id and name_snapshot='MOLEIRO';
  update squad_players set jersey=16,age=25,nationality_snapshot='ENGLAND',since_year=2020 where season_id=v_season_id and name_snapshot='AMAD';
  update squad_players set jersey=37,age=22,nationality_snapshot='ENGLAND',since_year=2019 where season_id=v_season_id and name_snapshot='MAINOO';
  update squad_players set jersey=2,age=21,nationality_snapshot='BELGIUM',since_year=2028 where season_id=v_season_id and name_snapshot='CAS FRANÇOIS';
  update squad_players set jersey=3,age=21,nationality_snapshot='PARAGUAY',since_year=2029 where season_id=v_season_id and name_snapshot='ARCE';
  update squad_players set jersey=5,age=20,nationality_snapshot='URUGUAY',since_year=2033 where season_id=v_season_id and name_snapshot='MOURIÑO';
  update squad_players set jersey=25,age=17,nationality_snapshot='ENGLAND',since_year=2028 where season_id=v_season_id and name_snapshot='BURNETT';
  update squad_players set jersey=1,age=20,nationality_snapshot='BELGIUM',since_year=2032 where season_id=v_season_id and name_snapshot='SENNE LAMMENS';
  update squad_players set jersey=21,age=18,nationality_snapshot='ENGLAND',since_year=2030 where season_id=v_season_id and name_snapshot='MOORHOUSE';
  update squad_players set jersey=20,age=22,nationality_snapshot='BRAZIL',since_year=2035 where season_id=v_season_id and name_snapshot='CUNHA';
  update squad_players set jersey=8,age=25,nationality_snapshot='PORTUGAL',since_year=2027 where season_id=v_season_id and name_snapshot='VITINHA';
  update squad_players set jersey=6,age=22,nationality_snapshot='DENMARK',since_year=2030 where season_id=v_season_id and name_snapshot='THOMASSEN';
  update squad_players set jersey=14,age=19,nationality_snapshot='IRELAND',since_year=2033 where season_id=v_season_id and name_snapshot='OYEDELE';
  update squad_players set jersey=24,age=22,nationality_snapshot='WALES',since_year=2033 where season_id=v_season_id and name_snapshot='WOODS';
  update squad_players set jersey=18,age=18,nationality_snapshot='ENGLAND',since_year=2033 where season_id=v_season_id and name_snapshot='ALUKO';
  update squad_players set jersey=4,age=20,nationality_snapshot='GERMANY',since_year=2035 where season_id=v_season_id and name_snapshot='FREDRICSON';
end $$;
