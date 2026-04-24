-- is_admin() returns true iff the authenticated JWT email is in the admins table.
create or replace function public.is_admin() returns boolean
language sql stable
as $$
  select exists (
    select 1
    from public.admins
    where email = (auth.jwt() ->> 'email')::citext
  );
$$;

-- current_email() — convenience wrapper around the JWT email claim.
create or replace function public.current_email() returns citext
language sql stable
as $$
  select (auth.jwt() ->> 'email')::citext;
$$;
