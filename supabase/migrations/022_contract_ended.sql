-- 022: contract end date for the Resign flow
alter table contracts add column if not exists ended_year int;
alter table contracts add column if not exists ended_month int;
