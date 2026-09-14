-- 021: club vs international contracts
alter table contracts add column if not exists contract_type text default 'club' check (contract_type in ('club','international'));
update contracts set contract_type = 'club' where contract_type is null;
