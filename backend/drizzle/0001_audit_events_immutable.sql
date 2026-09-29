create or replace function prevent_audit_event_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'audit_events are immutable';
end;
$$;

create trigger audit_events_no_update
before update on audit_events
for each row execute function prevent_audit_event_mutation();

create trigger audit_events_no_delete
before delete on audit_events
for each row execute function prevent_audit_event_mutation();
