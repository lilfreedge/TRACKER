-- ============================================================
-- Seed the team catalog with top clubs across Europe + major
-- leagues. Colors are the official primary. Crest URLs go
-- through images.weserv.nl (a free image proxy that adds CORS
-- headers so <img> tags work reliably from the browser).
-- ============================================================

insert into team_catalog (name, country, primary_color, text_color, crest_url, aliases) values
-- Premier League
('Manchester United',   'ENGLAND', '#DA291C', '#FBE122', 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/7/7a/Manchester_United_FC_crest.svg/300px-Manchester_United_FC_crest.svg.png', array['Man United','MUFC','United']),
('Manchester City',     'ENGLAND', '#6CABDD', '#FFFFFF', 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/e/eb/Manchester_City_FC_badge.svg/300px-Manchester_City_FC_badge.svg.png', array['Man City','City','MCFC']),
('Arsenal',             'ENGLAND', '#EF0107', '#FFFFFF', 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/5/53/Arsenal_FC.svg/300px-Arsenal_FC.svg.png', array['Arsenal FC','Gunners']),
('Chelsea',             'ENGLAND', '#034694', '#FFFFFF', 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/c/cc/Chelsea_FC.svg/300px-Chelsea_FC.svg.png', array['CFC','Blues']),
('Liverpool',           'ENGLAND', '#C8102E', '#FFFFFF', 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/0/0c/Liverpool_FC.svg/300px-Liverpool_FC.svg.png', array['LFC','Reds']),
('Tottenham Hotspur',   'ENGLAND', '#132257', '#FFFFFF', 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/b/b4/Tottenham_Hotspur.svg/300px-Tottenham_Hotspur.svg.png', array['Spurs','THFC']),
('Newcastle United',    'ENGLAND', '#241F20', '#FFFFFF', 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/5/56/Newcastle_United_Logo.svg/300px-Newcastle_United_Logo.svg.png', array['Newcastle','Magpies']),
('Aston Villa',         'ENGLAND', '#95BFE5', '#670E36', 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/f/f9/Aston_Villa_FC_crest_%282016%29.svg/300px-Aston_Villa_FC_crest_%282016%29.svg.png', array['Villa']),
('Brighton',            'ENGLAND', '#0057B8', '#FFFFFF', 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/f/fd/Brighton_%26_Hove_Albion_logo.svg/300px-Brighton_%26_Hove_Albion_logo.svg.png', array['Brighton & Hove Albion','Seagulls']),
('West Ham United',     'ENGLAND', '#7A263A', '#1BB1E7', 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/c/c2/West_Ham_United_FC_logo.svg/300px-West_Ham_United_FC_logo.svg.png', array['West Ham','Hammers']),
('Nottingham Forest',   'ENGLAND', '#DD0000', '#FFFFFF', 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/e/e5/Nottingham_Forest_F.C._logo.svg/300px-Nottingham_Forest_F.C._logo.svg.png', array['Forest']),
-- La Liga
('FC Barcelona',        'SPAIN',   '#A50044', '#EDBB00', 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_Barcelona_%28crest%29.svg/300px-FC_Barcelona_%28crest%29.svg.png', array['Barcelona','Barça','FCB']),
('Real Madrid',         'SPAIN',   '#FEBE10', '#00529F', 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/300px-Real_Madrid_CF.svg.png', array['Madrid','RMCF']),
('Atlético de Madrid',  'SPAIN',   '#CB3524', '#FFFFFF', 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/f/f4/Atletico_Madrid_2017_logo.svg/300px-Atletico_Madrid_2017_logo.svg.png', array['Atletico Madrid','Atleti','A. Madrid','ATM']),
('Athletic Club Bilbao','SPAIN',   '#EE2523', '#FFFFFF', 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/9/98/Club_Athletic_Bilbao_logo.svg/300px-Club_Athletic_Bilbao_logo.svg.png', array['Athletic Bilbao','Bilbao']),
('Real Sociedad',       'SPAIN',   '#003B7A', '#FFFFFF', 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/f/f1/Real_Sociedad_logo.svg/300px-Real_Sociedad_logo.svg.png', array['La Real']),
('Sevilla',             'SPAIN',   '#D50000', '#FFFFFF', 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/3/3b/Sevilla_FC_logo.svg/300px-Sevilla_FC_logo.svg.png', array['Sevilla FC']),
('Real Betis',          'SPAIN',   '#00954D', '#FFFFFF', 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/1/13/Real_betis_logo.svg/300px-Real_betis_logo.svg.png', array['Betis']),
('Valencia CF',         'SPAIN',   '#F8A72C', '#000000', 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/c/ce/Valenciacf.svg/300px-Valenciacf.svg.png', array['Valencia']),
('RC Deportivo La Coruña','SPAIN', '#00529F', '#FFFFFF', 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/3/33/RC_Deportivo_La_Coru%C3%B1a_logo.svg/300px-RC_Deportivo_La_Coru%C3%B1a_logo.svg.png', array['Deportivo','Depor','Dépor']),
('Villarreal',          'SPAIN',   '#FFE667', '#00558C', 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/b/b9/Villarreal_CF_logo.svg/300px-Villarreal_CF_logo.svg.png', array['Villarreal CF','Yellow Submarine']),
-- Serie A
('Juventus',            'ITALY',   '#000000', '#FFFFFF', 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Juventus_FC_2017_logo.svg/300px-Juventus_FC_2017_logo.svg.png', array['Juve']),
('Inter Milan',         'ITALY',   '#010E80', '#FFFFFF', 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/commons/thumb/0/05/FC_Internazionale_Milano_2021.svg/300px-FC_Internazionale_Milano_2021.svg.png', array['Inter','Internazionale','Lombardia FC']),
('AC Milan',            'ITALY',   '#FB090B', '#000000', 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Logo_of_AC_Milan.svg/300px-Logo_of_AC_Milan.svg.png', array['Milan','Milano FC']),
('SSC Napoli',          'ITALY',   '#12A0D7', '#FFFFFF', 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/commons/thumb/2/2d/SSC_Neapel.svg/300px-SSC_Neapel.svg.png', array['Napoli']),
('AS Roma',             'ITALY',   '#8E1F2F', '#F0BC42', 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/f/f7/AS_Roma_logo_%282017%29.svg/300px-AS_Roma_logo_%282017%29.svg.png', array['Roma']),
('Lazio',               'ITALY',   '#87CEEB', '#FFFFFF', 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/commons/thumb/c/ce/SS_Lazio_badge.svg/300px-SS_Lazio_badge.svg.png', array['SS Lazio']),
('Fiorentina',          'ITALY',   '#592C82', '#FFFFFF', 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Logo_ACF_Fiorentina.svg/300px-Logo_ACF_Fiorentina.svg.png', array['ACF Fiorentina','Viola']),
('Atalanta',            'ITALY',   '#1E71B8', '#000000', 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/6/66/AtalantaBC.svg/300px-AtalantaBC.svg.png', array['Atalanta BC','Bergamo Calcio']),
-- Bundesliga
('Bayern Munich',       'GERMANY', '#DC052D', '#0066B2', 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/commons/thumb/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg/300px-FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg.png', array['Bayern','FC Bayern']),
('Borussia Dortmund',   'GERMANY', '#FDE100', '#000000', 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/commons/thumb/6/67/Borussia_Dortmund_logo.svg/300px-Borussia_Dortmund_logo.svg.png', array['BVB','Dortmund']),
('RB Leipzig',          'GERMANY', '#D3082D', '#001F5F', 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/0/04/RB_Leipzig_2014_logo.svg/300px-RB_Leipzig_2014_logo.svg.png', array['Leipzig']),
('Bayer Leverkusen',    'GERMANY', '#E32221', '#000000', 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/5/59/Bayer_04_Leverkusen_logo.svg/300px-Bayer_04_Leverkusen_logo.svg.png', array['Leverkusen','B04']),
('Eintracht Frankfurt', 'GERMANY', '#E1000F', '#000000', 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/commons/thumb/0/04/Eintracht_Frankfurt_Logo.svg/300px-Eintracht_Frankfurt_Logo.svg.png', array['Frankfurt']),
('VfL Wolfsburg',       'GERMANY', '#65B32E', '#FFFFFF', 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Logo-VfL-Wolfsburg.svg/300px-Logo-VfL-Wolfsburg.svg.png', array['Wolfsburg']),
-- Ligue 1
('Paris Saint-Germain', 'FRANCE',  '#004170', '#DA291C', 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/a/a7/Paris_Saint-Germain_F.C..svg/300px-Paris_Saint-Germain_F.C..svg.png', array['PSG','Paris SG','Paris FC']),
('Olympique de Marseille','FRANCE','#009DDC', '#FFFFFF', 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Olympique_Marseille_logo.svg/300px-Olympique_Marseille_logo.svg.png', array['Marseille','OM']),
('Olympique Lyonnais',  'FRANCE',  '#0033A0', '#EF4056', 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/b/b9/Olympique_Lyonnais.svg/300px-Olympique_Lyonnais.svg.png', array['Lyon','OL']),
('AS Monaco',           'FRANCE',  '#E30613', '#FFFFFF', 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/b/ba/AS_Monaco_FC.svg/300px-AS_Monaco_FC.svg.png', array['Monaco']),
-- Others
('Inter Miami CF',      'USA',     '#F7B5CD', '#000000', 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/5/5c/Inter_Miami_CF_logo.svg/300px-Inter_Miami_CF_logo.svg.png', array['Miami','Inter Miami','IMCF']),
('Ajax',                'NETHERLANDS','#D2122E','#FFFFFF','https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/7/79/Ajax_Amsterdam.svg/300px-Ajax_Amsterdam.svg.png', array['AFC Ajax']),
('PSV Eindhoven',       'NETHERLANDS','#ED1B24','#FFFFFF','https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/commons/thumb/e/ea/PSV_Eindhoven.svg/300px-PSV_Eindhoven.svg.png', array['PSV']),
('Feyenoord',           'NETHERLANDS','#EC0000','#FFFFFF','https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Feyenoord_logo.svg/300px-Feyenoord_logo.svg.png', array['Feyernoord']),
('Benfica',             'PORTUGAL','#EE1C25','#FFFFFF','https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/a/a2/SL_Benfica_logo.svg/300px-SL_Benfica_logo.svg.png', array['SL Benfica']),
('FC Porto',            'PORTUGAL','#004494','#FFFFFF','https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/f/f1/FC_Porto.svg/300px-FC_Porto.svg.png', array['Porto']),
('Sporting CP',         'PORTUGAL','#008057','#FFFFFF','https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/3/3e/Sporting_Clube_de_Portugal_%28Logo%29.svg/300px-Sporting_Clube_de_Portugal_%28Logo%29.svg.png', array['Sporting']),
('Galatasaray',         'TURKEY','#FFB612','#A80532','https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/8/85/Galatasaray_Star_Logo.png/300px-Galatasaray_Star_Logo.png', array['Gala']),
('Fenerbahçe',          'TURKEY','#FFED00','#00284A','https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/1/13/Fenerbah%C3%A7e_SK.png/300px-Fenerbah%C3%A7e_SK.png', array['Fenerbahce'])
on conflict do nothing;

-- Also patch the rivals seed (008) to use proxied logos
update rivals set notes = 'logo:https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_Barcelona_%28crest%29.svg/300px-FC_Barcelona_%28crest%29.svg.png'
where rival_team = 'FC BARCELONA';
update rivals set notes = 'logo:https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/300px-Real_Madrid_CF.svg.png'
where rival_team = 'REAL MADRID';
update rivals set notes = 'logo:https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/e/eb/Manchester_City_FC_badge.svg/300px-Manchester_City_FC_badge.svg.png'
where rival_team = 'MANCHESTER CITY';
update rivals set notes = 'logo:https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/5/5c/Inter_Miami_CF_logo.svg/300px-Inter_Miami_CF_logo.svg.png'
where rival_team = 'INTER MIAMI CF';
