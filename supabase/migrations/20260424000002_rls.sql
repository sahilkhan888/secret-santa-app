-- Enable RLS on all app tables.
alter table events           enable row level security;
alter table participants     enable row level security;
alter table matches          enable row level security;
alter table gift_suggestions enable row level security;
alter table admins           enable row level security;

-- Events -----------------------------------------------------------
-- Anyone authenticated may read an event once it is open or later.
create policy events_read_public on events for select
  using (status in ('open', 'closed', 'drawn', 'completed') or public.is_admin());

-- Admins may do anything with events.
create policy events_admin_all on events for all
  using (public.is_admin())
  with check (public.is_admin());

-- Participants -----------------------------------------------------
-- Self-read: a participant can always read their own row (by email on the JWT).
create policy participants_self_read on participants for select
  using (email = public.current_email());

-- Giftee-read: after an event's reveal_at, the Santa may read their giftee's row.
create policy participants_giftee_read on participants for select
  using (
    exists (
      select 1
      from matches m
      join events e on e.id = m.event_id
      join participants santa on santa.id = m.santa_id
      where m.giftee_id = participants.id
        and santa.email = public.current_email()
        and now() >= e.reveal_at
    )
  );

-- Admin full access.
create policy participants_admin_all on participants for all
  using (public.is_admin())
  with check (public.is_admin());

-- Matches ----------------------------------------------------------
-- Santa may read their own match after reveal_at.
create policy matches_santa_read on matches for select
  using (
    exists (
      select 1
      from participants p
      join events e on e.id = matches.event_id
      where p.id = matches.santa_id
        and p.email = public.current_email()
        and now() >= e.reveal_at
    )
  );

create policy matches_admin_all on matches for all
  using (public.is_admin())
  with check (public.is_admin());

-- Gift suggestions -------------------------------------------------
create policy gift_suggestions_santa_read on gift_suggestions for select
  using (
    exists (
      select 1
      from matches m
      join participants p on p.id = m.santa_id
      join events e on e.id = m.event_id
      where m.id = gift_suggestions.match_id
        and p.email = public.current_email()
        and now() >= e.reveal_at
    )
  );

create policy gift_suggestions_admin_all on gift_suggestions for all
  using (public.is_admin())
  with check (public.is_admin());

-- Admins table -----------------------------------------------------
-- Only admins may read or modify the admins table itself.
create policy admins_admin_all on admins for all
  using (public.is_admin())
  with check (public.is_admin());
