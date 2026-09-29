-- Better Auth persists email_verified as a boolean. Existing timestamp values,
-- if any, represent a completed verification and therefore become true.
alter table "user"
  alter column email_verified type boolean
    using case when email_verified is null then false else true end,
  alter column email_verified set default false,
  alter column email_verified set not null;
