-- 028: club_since_month on seasons so banners can show "Paris FC · since May 2026"
alter table seasons add column if not exists club_since_month int;
-- Backfill from the linked contract when available
update seasons se
set club_since_month = c.signed_month
from contracts c
where se.contract_id = c.id and se.club_since_month is null and c.signed_month is not null;
