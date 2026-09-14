-- 027: set the EAFC 26 game card cover to the local FC 26 poster asset
update games set cover_url = '/covers/eafc26.jpeg' where lower(name) in ('eafc 26','eafc26','eafc_26','eafc-26');
