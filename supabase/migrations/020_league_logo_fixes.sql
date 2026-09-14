-- 020: null out country for UEFA competitions (they're multinational) and
-- swap in known-good rasterized logo URLs behind the weserv proxy.
update save_competitions set country = null where name in ('UEFA Champions League','UEFA Europa League','UEFA Conference League');

update save_competitions set logo_url = 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/b/bf/UEFA_Champions_League_logo_2.svg/1200px-UEFA_Champions_League_logo_2.svg.png' where name = 'UEFA Champions League';
update save_competitions set logo_url = 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/d/d8/UEFA_Europa_League_logo_2024.svg/1200px-UEFA_Europa_League_logo_2024.svg.png' where name = 'UEFA Europa League';
update save_competitions set logo_url = 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/8/8f/UEFA_Conference_League.svg/1200px-UEFA_Conference_League.svg.png' where name = 'UEFA Conference League';
update save_competitions set logo_url = 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/9/92/LaLiga.svg/1200px-LaLiga.svg.png' where name = 'La Liga';
update save_competitions set logo_url = 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/f/f2/Premier_League_Logo.svg/1200px-Premier_League_Logo.svg.png' where name = 'Premier League';
update save_competitions set logo_url = 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/thumb/d/df/Bundesliga_logo_%282017%29.svg/1200px-Bundesliga_logo_%282017%29.svg.png' where name = 'Bundesliga';
