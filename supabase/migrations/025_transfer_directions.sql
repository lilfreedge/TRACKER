-- 025: allow loan directions on transfers
do $$
declare c record;
begin
  for c in select conname from pg_constraint where conrelid = 'transfers'::regclass and contype = 'c' loop
    execute format('alter table transfers drop constraint %I', c.conname);
  end loop;
end $$;
alter table transfers add constraint transfers_direction_check check (direction in ('in','out','loan_in','loan_out'));
