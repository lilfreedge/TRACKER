-- 023: massively expand team_catalog with European clubs (1st + 2nd division)
-- and national teams. Crest URLs point to Wikipedia PNG thumbs proxied through
-- images.weserv.nl to avoid CORS. Missing crests render the initials fallback.

-- ==========================================
-- Ligue 1 (France) — includes PARIS FC
-- ==========================================
insert into team_catalog (name, country, primary_color, text_color, crest_url, aliases) values
  ('Paris Saint-Germain','France','#0b1e5b','#ffffff','https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/a/a7/Paris_Saint-Germain_F.C..svg/240px-Paris_Saint-Germain_F.C..svg.png', array['PSG']),
  ('Paris FC','France','#0000ff','#ffffff',null,array['ParisFC']),
  ('Olympique Marseille','France','#009de0','#ffffff','https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/d/d8/Olympique_Marseille_logo.svg/240px-Olympique_Marseille_logo.svg.png',array['OM']),
  ('Olympique Lyonnais','France','#ffffff','#e40e2a','https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/f/f8/Olympique_Lyonnais.svg/240px-Olympique_Lyonnais.svg.png',array['OL','Lyon']),
  ('AS Monaco','France','#e30613','#ffffff',null,array['Monaco']),
  ('OGC Nice','France','#c8102e','#000000',null,array['Nice']),
  ('Stade Rennais','France','#e30613','#ffffff',null,array['Rennes']),
  ('LOSC Lille','France','#e30613','#ffffff',null,array['Lille']),
  ('RC Lens','France','#ffcc00','#e30613',null,array['Lens']),
  ('Toulouse FC','France','#582d90','#ffffff',null,array['Toulouse']),
  ('Stade Brestois','France','#e30613','#ffffff',null,array['Brest']),
  ('Le Havre AC','France','#009de0','#ffffff',null,array['Le Havre']),
  ('AJ Auxerre','France','#003c96','#ffffff',null,array['Auxerre']),
  ('Angers SCO','France','#000000','#ffffff',null,array['Angers']),
  ('FC Nantes','France','#fff100','#008a52',null,array['Nantes']),
  ('Montpellier HSC','France','#ff5f00','#003a70',null,array['Montpellier']),
  ('FC Metz','France','#920403','#ffffff',null,array['Metz']),
  ('Stade de Reims','France','#e30613','#ffffff',null,array['Reims'])
on conflict (name) do nothing;

-- ==========================================
-- Premier League (England) — full 20
-- ==========================================
insert into team_catalog (name, country, primary_color, text_color, crest_url, aliases) values
  ('Manchester City','England','#6cabdd','#ffffff','https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/e/eb/Manchester_City_FC_badge.svg/240px-Manchester_City_FC_badge.svg.png',array['Man City','MCFC']),
  ('Arsenal','England','#ef0107','#ffffff','https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/5/53/Arsenal_FC.svg/240px-Arsenal_FC.svg.png',array['AFC']),
  ('Liverpool','England','#c8102e','#ffffff','https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/0/0c/Liverpool_FC.svg/240px-Liverpool_FC.svg.png',array['LFC']),
  ('Manchester United','England','#da291c','#ffe500','https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/7/7a/Manchester_United_FC_crest.svg/240px-Manchester_United_FC_crest.svg.png',array['Man United','MUFC']),
  ('Chelsea','England','#034694','#ffffff','https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/c/cc/Chelsea_FC.svg/240px-Chelsea_FC.svg.png',array['CFC']),
  ('Tottenham Hotspur','England','#ffffff','#132257','https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/b/b4/Tottenham_Hotspur.svg/240px-Tottenham_Hotspur.svg.png',array['Spurs','THFC']),
  ('Newcastle United','England','#000000','#ffffff','https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/5/56/Newcastle_United_Logo.svg/240px-Newcastle_United_Logo.svg.png',array['NUFC']),
  ('Aston Villa','England','#95bfe5','#7a003c','https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/f/f9/Aston_Villa_FC_new_crest.svg/240px-Aston_Villa_FC_new_crest.svg.png',array['Villa']),
  ('Brighton & Hove Albion','England','#0057b8','#ffffff',null,array['Brighton','BHAFC']),
  ('West Ham United','England','#7a263a','#1bb1e7',null,array['West Ham','WHU']),
  ('Everton','England','#003399','#ffffff',null,array['EFC']),
  ('Fulham','England','#ffffff','#000000',null,array['FFC']),
  ('Crystal Palace','England','#1b458f','#c4122e',null,array['CPFC']),
  ('Wolverhampton Wanderers','England','#fdb913','#231f20',null,array['Wolves']),
  ('Nottingham Forest','England','#dd0000','#ffffff',null,array['NFFC','Forest']),
  ('Bournemouth','England','#da291c','#000000',null,array['AFCB']),
  ('Brentford','England','#e30613','#ffffff',null,array['BFC']),
  ('Southampton','England','#d71920','#ffffff',null,array['Saints']),
  ('Ipswich Town','England','#0044a9','#ffffff',null,array['Ipswich']),
  ('Leicester City','England','#003090','#ffffff',null,array['LCFC','Leicester']),
  ('Leeds United','England','#ffffff','#1d428a',null,array['Leeds']),
  ('Burnley','England','#7a263a','#87ceeb',null,array['BFC'])
on conflict (name) do nothing;

-- ==========================================
-- La Liga (Spain) — full 20
-- ==========================================
insert into team_catalog (name, country, primary_color, text_color, crest_url, aliases) values
  ('Real Madrid','Spain','#ffffff','#1e3a8a','https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/240px-Real_Madrid_CF.svg.png',array['Madrid','RMCF']),
  ('FC Barcelona','Spain','#004d98','#a50044','https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_Barcelona_%28crest%29.svg/240px-FC_Barcelona_%28crest%29.svg.png',array['Barça','Barsa','Barcelona']),
  ('Atlético de Madrid','Spain','#cb3524','#ffffff','https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/f/f4/Atletico_Madrid_2017_logo.svg/240px-Atletico_Madrid_2017_logo.svg.png',array['A. Madrid','Atleti']),
  ('Sevilla','Spain','#ffffff','#d70b1a',null,array['SFC']),
  ('Real Betis','Spain','#00954c','#ffffff',null,array['Betis']),
  ('Real Sociedad','Spain','#003bb8','#ffffff',null,array['La Real','Sociedad']),
  ('Athletic Club','Spain','#ee2523','#ffffff',null,array['Athletic Bilbao','Bilbao']),
  ('Villarreal','Spain','#fff200','#d10000',null,array['Yellow Sub']),
  ('Valencia','Spain','#f7a600','#000000',null,array['VCF']),
  ('Girona','Spain','#c8102e','#ffffff',null,array['Girona']),
  ('Osasuna','Spain','#0a2e6f','#e30613',null,array['CA Osasuna']),
  ('Getafe','Spain','#005ca9','#ffffff',null,array['Geta']),
  ('Rayo Vallecano','Spain','#ffffff','#e30613',null,array['Rayo']),
  ('Mallorca','Spain','#e30613','#000000',null,array['RCD Mallorca']),
  ('Celta Vigo','Spain','#89bce9','#ffffff',null,array['Celta']),
  ('Alavés','Spain','#0e4d92','#ffffff',null,array['Alaves']),
  ('Las Palmas','Spain','#ffe600','#005cb9',null,array['UD Las Palmas']),
  ('Espanyol','Spain','#005cb9','#ffffff',null,array['RCDE']),
  ('Leganés','Spain','#003b7a','#ffffff',null,array['Lega']),
  ('Valladolid','Spain','#7a3f9d','#ffffff',null,array['Real Valladolid'])
on conflict (name) do nothing;

-- ==========================================
-- Bundesliga (Germany) — full 18
-- ==========================================
insert into team_catalog (name, country, primary_color, text_color, crest_url, aliases) values
  ('Bayern Munich','Germany','#dc052d','#ffffff','https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/commons/thumb/1/1b/FC_Bayern_München_logo_%282017%29.svg/240px-FC_Bayern_München_logo_%282017%29.svg.png',array['FC Bayern','Bayern']),
  ('Borussia Dortmund','Germany','#fde100','#000000','https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/commons/thumb/6/67/Borussia_Dortmund_logo.svg/240px-Borussia_Dortmund_logo.svg.png',array['BVB','Dortmund']),
  ('Bayer Leverkusen','Germany','#e32221','#000000','https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/5/59/Bayer_04_Leverkusen_logo.svg/240px-Bayer_04_Leverkusen_logo.svg.png',array['B04','Leverkusen']),
  ('RB Leipzig','Germany','#dd0741','#ffffff',null,array['RBL','Leipzig']),
  ('VfB Stuttgart','Germany','#e30613','#ffffff',null,array['Stuttgart']),
  ('Eintracht Frankfurt','Germany','#000000','#e1000f',null,array['SGE','Frankfurt']),
  ('Borussia Mönchengladbach','Germany','#ffffff','#000000',null,array['Gladbach','BMG']),
  ('Werder Bremen','Germany','#1d9053','#ffffff',null,array['Bremen']),
  ('Wolfsburg','Germany','#65b32e','#ffffff',null,array['VfL Wolfsburg']),
  ('Hoffenheim','Germany','#1961ac','#ffffff',null,array['TSG','1899 Hoffenheim']),
  ('Freiburg','Germany','#e30613','#000000',null,array['SC Freiburg']),
  ('Union Berlin','Germany','#e30613','#ffffff',null,array['1. FC Union']),
  ('Mainz 05','Germany','#c8102e','#ffffff',null,array['Mainz']),
  ('FC Augsburg','Germany','#c8102e','#009d5e',null,array['Augsburg']),
  ('FC Heidenheim','Germany','#e30613','#003a70',null,array['Heidenheim']),
  ('Holstein Kiel','Germany','#004b93','#ffffff',null,array['Kiel']),
  ('FC St. Pauli','Germany','#7d3831','#ffffff',null,array['St. Pauli']),
  ('VfL Bochum','Germany','#005ca9','#ffffff',null,array['Bochum'])
on conflict (name) do nothing;

-- ==========================================
-- Serie A (Italy) — full 20
-- ==========================================
insert into team_catalog (name, country, primary_color, text_color, crest_url, aliases) values
  ('Inter Milan','Italy','#010e80','#010101','https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/commons/thumb/0/05/FC_Internazionale_Milano_2021.svg/240px-FC_Internazionale_Milano_2021.svg.png',array['Inter','Internazionale']),
  ('AC Milan','Italy','#fb090b','#000000','https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Logo_of_AC_Milan.svg/240px-Logo_of_AC_Milan.svg.png',array['Milan','ACM']),
  ('Juventus','Italy','#000000','#ffffff','https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/commons/thumb/1/15/Juventus_FC_2017_logo.svg/240px-Juventus_FC_2017_logo.svg.png',array['Juve']),
  ('Napoli','Italy','#12a0d7','#ffffff','https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/commons/thumb/2/2d/SSC_Neapel.svg/240px-SSC_Neapel.svg.png',array['SSC Napoli']),
  ('Roma','Italy','#8e1f2f','#f0bc42',null,array['AS Roma']),
  ('Lazio','Italy','#87ceeb','#ffffff',null,array['SS Lazio']),
  ('Atalanta','Italy','#1c1c1c','#005cb9',null,array['Atalanta BC']),
  ('Fiorentina','Italy','#582c83','#ffffff',null,array['Viola']),
  ('Bologna','Italy','#8e1f2f','#001e62',null,array['Bologna FC']),
  ('Torino','Italy','#8e1f2f','#ffffff',null,array['Toro']),
  ('Udinese','Italy','#000000','#ffffff',null,array['Udinese Calcio']),
  ('Genoa','Italy','#d40514','#0a1e4e',null,array['Genoa CFC']),
  ('Cagliari','Italy','#af1e2a','#083266',null,array['Cagliari Calcio']),
  ('Empoli','Italy','#0055a4','#ffffff',null,array['Empoli FC']),
  ('Verona','Italy','#f6cc12','#0a1e4e',null,array['Hellas Verona']),
  ('Como','Italy','#1e88e5','#ffffff',null,array['Como 1907']),
  ('Parma','Italy','#ffe600','#003b7a',null,array['Parma Calcio']),
  ('Lecce','Italy','#f6cc12','#dc051f',null,array['US Lecce']),
  ('Monza','Italy','#e30613','#ffffff',null,array['AC Monza']),
  ('Venezia','Italy','#f6a100','#000000',null,array['Venezia FC'])
on conflict (name) do nothing;

-- ==========================================
-- Other top European leagues
-- ==========================================
insert into team_catalog (name, country, primary_color, text_color, crest_url, aliases) values
  -- Eredivisie
  ('Ajax','Netherlands','#d2122e','#ffffff',null,array['AFC Ajax']),
  ('PSV Eindhoven','Netherlands','#e50914','#ffffff',null,array['PSV']),
  ('Feyenoord','Netherlands','#e50914','#ffffff',null,array['Feyenoord Rotterdam']),
  ('AZ Alkmaar','Netherlands','#e30613','#ffffff',null,array['AZ']),
  ('FC Twente','Netherlands','#e30613','#ffffff',null,array['Twente']),
  ('FC Utrecht','Netherlands','#e30613','#ffffff',null,array['Utrecht']),
  -- Portugal Liga
  ('Benfica','Portugal','#e30613','#ffffff',null,array['SL Benfica']),
  ('Porto','Portugal','#003da5','#ffffff',null,array['FC Porto']),
  ('Sporting CP','Portugal','#008d36','#ffffff',null,array['Sporting Lisbon']),
  ('Braga','Portugal','#c8102e','#ffffff',null,array['SC Braga']),
  ('Vitória SC','Portugal','#ffffff','#000000',null,array['Vitoria Guimaraes']),
  -- Belgium
  ('Club Brugge','Belgium','#00449e','#ffffff',null,array['Brugge']),
  ('Anderlecht','Belgium','#7a2c8b','#ffffff',null,array['RSC Anderlecht']),
  ('Genk','Belgium','#005ca9','#ffffff',null,array['KRC Genk']),
  ('Antwerp','Belgium','#e30613','#ffffff',null,array['Royal Antwerp']),
  ('Union SG','Belgium','#e30613','#ffe600',null,array['Union Saint-Gilloise']),
  -- Turkey
  ('Galatasaray','Turkey','#e30613','#fbba00',null,array['Gala','GS']),
  ('Fenerbahçe','Turkey','#00297a','#fbba00',null,array['FB','Fener']),
  ('Beşiktaş','Turkey','#000000','#ffffff',null,array['BJK']),
  ('Trabzonspor','Turkey','#7d0a15','#722f37',null,array['Trabzon']),
  -- Scotland
  ('Celtic','Scotland','#008a3c','#ffffff',null,array['Celtic FC']),
  ('Rangers','Scotland','#005cb9','#ffffff',null,array['Rangers FC']),
  ('Aberdeen','Scotland','#e30613','#ffffff',null,array['Aberdeen FC']),
  -- Greece
  ('Olympiacos','Greece','#e30613','#ffffff',null,array['Olympiakos']),
  ('Panathinaikos','Greece','#008a3c','#ffffff',null,array['PAO']),
  ('AEK Athens','Greece','#fdb913','#000000',null,array['AEK']),
  ('PAOK','Greece','#000000','#ffffff',null,array['PAOK Thessaloniki']),
  -- Austria / Switzerland
  ('Red Bull Salzburg','Austria','#c8102e','#ffe600',null,array['RB Salzburg']),
  ('Sturm Graz','Austria','#000000','#ffe600',null,array['SK Sturm']),
  ('Rapid Wien','Austria','#008a3c','#ffffff',null,array['SK Rapid']),
  ('Young Boys','Switzerland','#ffe600','#000000',null,array['BSC Young Boys']),
  ('FC Basel','Switzerland','#e30613','#004b93',null,array['Basel']),
  ('Zurich','Switzerland','#005ca9','#ffffff',null,array['FC Zurich'])
on conflict (name) do nothing;

-- ==========================================
-- English Championship (2nd div) — top of it
-- ==========================================
insert into team_catalog (name, country, primary_color, text_color, crest_url, aliases) values
  ('Sheffield United','England','#ee2737','#ffffff',null,array['Sheffield Utd','SUFC']),
  ('Middlesbrough','England','#e30613','#ffffff',null,array['Boro']),
  ('West Bromwich Albion','England','#122f67','#ffffff',null,array['West Brom','WBA']),
  ('Norwich City','England','#00a650','#ffe600',null,array['Norwich']),
  ('Sunderland','England','#e30613','#ffffff',null,array['SAFC']),
  ('Coventry City','England','#87ceeb','#ffffff',null,array['Coventry']),
  ('Hull City','England','#f6a800','#000000',null,array['Hull']),
  ('Blackburn Rovers','England','#009de0','#ffffff',null,array['Blackburn']),
  ('Cardiff City','England','#005ca9','#ffffff',null,array['Cardiff']),
  ('Millwall','England','#005ca9','#ffffff',null,array['Millwall FC']),
  ('Preston North End','England','#005ca9','#ffffff',null,array['Preston']),
  ('QPR','England','#005ca9','#ffffff',null,array['Queens Park Rangers']),
  ('Watford','England','#fbee23','#000000',null,array['Watford FC']),
  ('Stoke City','England','#e30613','#ffffff',null,array['Stoke']),
  ('Swansea City','England','#ffffff','#000000',null,array['Swansea']),
  ('Derby County','England','#ffffff','#000000',null,array['Derby'])
on conflict (name) do nothing;

-- ==========================================
-- La Liga 2, Bundesliga 2, Serie B, Ligue 2 — selected
-- ==========================================
insert into team_catalog (name, country, primary_color, text_color, crest_url, aliases) values
  ('Sporting Gijón','Spain','#e30613','#ffffff',null,array['Gijon']),
  ('Real Oviedo','Spain','#005ca9','#ffffff',null,array['Oviedo']),
  ('Levante','Spain','#a50044','#005ca9',null,array['Levante UD']),
  ('Deportivo La Coruña','Spain','#005ca9','#ffffff',null,array['Depor','La Coruna']),
  ('Racing Santander','Spain','#008a3c','#ffffff',null,array['Racing']),
  ('Cadiz','Spain','#fdb913','#0a2e6f',null,array['Cadiz CF']),
  ('Malaga','Spain','#005ca9','#ffffff',null,array['Malaga CF']),
  ('Hertha Berlin','Germany','#005ca9','#ffffff',null,array['Hertha BSC']),
  ('Hamburger SV','Germany','#005ca9','#ffffff',null,array['HSV','Hamburg']),
  ('Schalke 04','Germany','#005ca9','#ffffff',null,array['S04']),
  ('1. FC Köln','Germany','#e30613','#ffffff',null,array['Köln','Koln','Cologne']),
  ('Fortuna Düsseldorf','Germany','#e30613','#ffffff',null,array['Fortuna']),
  ('Sampdoria','Italy','#005ca9','#ffffff',null,array['UC Sampdoria']),
  ('Palermo','Italy','#e30613','#ffffff',null,array['Palermo FC']),
  ('Bari','Italy','#e30613','#ffffff',null,array['SSC Bari']),
  ('Ajaccio','France','#e30613','#ffffff',null,array['AC Ajaccio']),
  ('Bastia','France','#005ca9','#ffe600',null,array['SC Bastia']),
  ('Guingamp','France','#e30613','#ffffff',null,array['EA Guingamp']),
  ('Saint-Étienne','France','#008a3c','#ffffff',null,array['ASSE','St-Etienne'])
on conflict (name) do nothing;

-- ==========================================
-- National teams (top FIFA rankings)
-- ==========================================
insert into team_catalog (name, country, primary_color, text_color, crest_url, aliases) values
  ('Argentina','Argentina','#75aadb','#ffffff',null,array['AFA','Albiceleste']),
  ('France','France','#0055a4','#ffffff',null,array['Les Bleus']),
  ('Spain','Spain','#c8102e','#fdb913',null,array['La Roja']),
  ('England','England','#ffffff','#0055a4',null,array['Three Lions']),
  ('Brazil','Brazil','#fedd00','#009c3b',null,array['Seleção']),
  ('Portugal','Portugal','#e30613','#008a3c',null,array['Portuguese']),
  ('Netherlands','Netherlands','#f36c21','#ffffff',null,array['Oranje','Holanda']),
  ('Belgium','Belgium','#e30613','#fdb913',null,array['Red Devils']),
  ('Italy','Italy','#0055a4','#ffffff',null,array['Azzurri']),
  ('Germany','Germany','#000000','#ffe600',null,array['Die Mannschaft']),
  ('Croatia','Croatia','#c8102e','#ffffff',null,array['Vatreni']),
  ('Uruguay','Uruguay','#75aadb','#ffffff',null,array['Charrúas']),
  ('Colombia','Colombia','#fedd00','#0033a0',null,array['Cafeteros']),
  ('Mexico','Mexico','#008a3c','#ffffff',null,array['El Tri']),
  ('United States','USA','#c8102e','#0055a4',null,array['USA','USMNT']),
  ('Denmark','Denmark','#c8102e','#ffffff',null,array['Danish Dynamite']),
  ('Switzerland','Switzerland','#c8102e','#ffffff',null,array['Nati']),
  ('Sweden','Sweden','#fecc00','#0055a4',null,array['Blågult']),
  ('Wales','Wales','#c8102e','#00a650',null,array['Dragons']),
  ('Serbia','Serbia','#e30613','#ffffff',null,array['Orlovi']),
  ('Poland','Poland','#ffffff','#c8102e',null,array['Bialo-Czerwoni']),
  ('Ukraine','Ukraine','#fedd00','#0055a4',null,array['Zhovto-Blakytni']),
  ('Austria','Austria','#c8102e','#ffffff',null,array['ÖFB']),
  ('Norway','Norway','#c8102e','#ffffff',null,array['Vikings']),
  ('Turkey','Turkey','#e30613','#ffffff',null,array['Ay Yildizlilar']),
  ('Ecuador','Ecuador','#fedd00','#0033a0',null,array['La Tri']),
  ('Peru','Peru','#c8102e','#ffffff',null,array['Blanquirroja']),
  ('Chile','Chile','#c8102e','#ffffff',null,array['La Roja']),
  ('Venezuela','Venezuela','#800020','#fedd00',null,array['La Vinotinto']),
  ('Paraguay','Paraguay','#c8102e','#0033a0',null,array['La Albirroja']),
  ('Bolivia','Bolivia','#008a3c','#fedd00',null,array['La Verde']),
  ('Costa Rica','Costa Rica','#c8102e','#ffffff',null,array['La Sele']),
  ('Panama','Panama','#c8102e','#0033a0',null,array['La Marea']),
  ('Honduras','Honduras','#0033a0','#ffffff',null,array['La H']),
  ('Guatemala','Guatemala','#4998d3','#ffffff',null,array['La Azul y Blanco']),
  ('El Salvador','El Salvador','#0055a4','#ffffff',null,array['La Selecta']),
  ('Nicaragua','Nicaragua','#0033a0','#ffffff',null,array['Pinoleros']),
  ('Jamaica','Jamaica','#009e60','#fecc00',null,array['Reggae Boyz']),
  ('Dominican Republic','Dominican Republic','#002d62','#ce1126',null,array['Sedofútbol','Quisqueya']),
  ('Trinidad and Tobago','Trinidad and Tobago','#c8102e','#000000',null,array['Soca Warriors']),
  ('Haiti','Haiti','#0055a4','#c8102e',null,array['Les Grenadiers']),
  ('Cuba','Cuba','#0055a4','#c8102e',null,array['Leones del Caribe']),
  ('Canada','Canada','#c8102e','#ffffff',null,array['Canucks']),
  ('Japan','Japan','#0055a4','#ffffff',null,array['Samurai Blue']),
  ('South Korea','South Korea','#c8102e','#0055a4',null,array['Taegeuk Warriors','Korea Republic']),
  ('Australia','Australia','#fedd00','#008a3c',null,array['Socceroos']),
  ('Saudi Arabia','Saudi Arabia','#00611b','#ffffff',null,array['Green Falcons']),
  ('Iran','Iran','#c8102e','#ffffff',null,array['Team Melli']),
  ('Qatar','Qatar','#800020','#ffffff',null,array['Al-Annabi']),
  ('Morocco','Morocco','#c8102e','#008a3c',null,array['Atlas Lions']),
  ('Senegal','Senegal','#008a3c','#fecc00',null,array['Teranga Lions']),
  ('Ivory Coast','Ivory Coast','#ff8200','#008a3c',null,array['Les Éléphants','Cote dIvoire']),
  ('Nigeria','Nigeria','#008a3c','#ffffff',null,array['Super Eagles']),
  ('Ghana','Ghana','#c8102e','#fedd00',null,array['Black Stars']),
  ('Cameroon','Cameroon','#008a3c','#c8102e',null,array['Indomitable Lions']),
  ('Egypt','Egypt','#c8102e','#000000',null,array['Pharaohs']),
  ('Algeria','Algeria','#008a3c','#ffffff',null,array['Fennec Foxes']),
  ('Tunisia','Tunisia','#c8102e','#ffffff',null,array['Eagles of Carthage']),
  ('South Africa','South Africa','#fedd00','#008a3c',null,array['Bafana Bafana']),
  ('Mali','Mali','#008a3c','#fedd00',null,array['Les Aigles']),
  ('Burkina Faso','Burkina Faso','#c8102e','#008a3c',null,array['Étalons']),
  ('DR Congo','DR Congo','#009de0','#fedd00',null,array['Léopards']),
  ('Kenya','Kenya','#008a3c','#c8102e',null,array['Harambee Stars']),
  ('Israel','Israel','#0055a4','#ffffff',null,array['Blue and White']),
  ('Iraq','Iraq','#008a3c','#ffffff',null,array['Lions of Mesopotamia']),
  ('UAE','UAE','#008a3c','#c8102e',null,array['White']),
  ('Uzbekistan','Uzbekistan','#0055a4','#ffffff',null,array['White Wolves']),
  ('New Zealand','New Zealand','#ffffff','#000000',null,array['All Whites']),
  ('Scotland','Scotland','#0055a4','#ffffff',null,array['Tartan Army']),
  ('Ireland','Ireland','#008a3c','#ffffff',null,array['The Boys in Green']),
  ('Northern Ireland','Northern Ireland','#008a3c','#ffffff',null,array['GAWA']),
  ('Iceland','Iceland','#0055a4','#ffffff',null,array['Strákarnir okkar']),
  ('Finland','Finland','#003580','#ffffff',null,array['Huuhkajat']),
  ('Czech Republic','Czech Republic','#c8102e','#ffffff',null,array['Czechia']),
  ('Slovakia','Slovakia','#0055a4','#ffffff',null,array['Repre']),
  ('Slovenia','Slovenia','#0055a4','#ffffff',null,array['Zmajčki']),
  ('Hungary','Hungary','#008a3c','#c8102e',null,array['Magic Magyars']),
  ('Romania','Romania','#fecc00','#0055a4',null,array['Tricolorii']),
  ('Bulgaria','Bulgaria','#008a3c','#ffffff',null,array['Lions']),
  ('Greece','Greece','#0055a4','#ffffff',null,array['Piratiko']),
  ('Albania','Albania','#c8102e','#000000',null,array['Kuq e Zinjtë']),
  ('North Macedonia','North Macedonia','#c8102e','#fedd00',null,array['Crveni Lavovi']),
  ('Bosnia and Herzegovina','Bosnia and Herzegovina','#fedd00','#0055a4',null,array['Zmajevi']),
  ('Montenegro','Montenegro','#c8102e','#fedd00',null,array['Hrabri Sokolovi']),
  ('Georgia','Georgia','#c8102e','#ffffff',null,array['Crusaders']),
  ('Armenia','Armenia','#c8102e','#0055a4',null,array['Ambitious Armenians']),
  ('Azerbaijan','Azerbaijan','#008a3c','#c8102e',null,array['Milli']),
  ('Belarus','Belarus','#008a3c','#c8102e',null,array['White Wings']),
  ('Kazakhstan','Kazakhstan','#009de0','#fedd00',null,array['Barys'])
on conflict (name) do nothing;
