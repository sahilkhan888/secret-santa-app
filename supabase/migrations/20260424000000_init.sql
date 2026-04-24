-- Extensions
create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- Enums
create type event_status as enum ('draft', 'open', 'closed', 'drawn', 'completed');
create type hot_drink    as enum ('coffee', 'tea', 'neither');
create type shirt_size   as enum ('xs', 's', 'm', 'l', 'xl', 'xxl', 'none');

-- Events
create table events (
  id                      uuid primary key default gen_random_uuid(),
  name                    text not null check (length(name) between 1 and 120),
  slug                    text not null unique
                          check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  registration_opens_at   timestamptz not null,
  registration_closes_at  timestamptz not null,
  reveal_at               timestamptz not null,
  gifting_day             date not null,
  status                  event_status not null default 'draft',
  created_by              uuid references auth.users(id) on delete set null,
  created_at              timestamptz not null default now(),
  check (registration_opens_at < registration_closes_at),
  check (registration_closes_at <= reveal_at)
);

create index events_slug_idx on events (slug);

-- Participants
create table participants (
  id                 uuid primary key default gen_random_uuid(),
  event_id           uuid not null references events(id) on delete cascade,
  name               text not null check (length(name) between 1 and 120),
  team               text not null check (length(team) between 1 and 80),
  email              citext not null,
  budget_amount      integer not null check (budget_amount > 0),
  wishlist_likes     text    not null default '' check (length(wishlist_likes)    <= 2000),
  wishlist_dislikes  text    not null default '' check (length(wishlist_dislikes) <= 2000),
  hot_drink          hot_drink not null default 'neither',
  shirt_size         shirt_size not null default 'none',
  joined_at          timestamptz not null default now(),
  is_active          boolean not null default true,
  unique (event_id, email)
);

create index participants_event_idx       on participants (event_id);
create index participants_event_email_idx on participants (event_id, email);

-- Matches
create table matches (
  id                 uuid primary key default gen_random_uuid(),
  event_id           uuid not null references events(id) on delete cascade,
  santa_id           uuid not null references participants(id) on delete cascade,
  giftee_id          uuid not null references participants(id) on delete cascade,
  budget_bucket_min  integer not null,
  budget_bucket_max  integer not null,
  revealed_at        timestamptz,
  created_at         timestamptz not null default now(),
  unique (event_id, santa_id),
  unique (event_id, giftee_id),
  check (santa_id <> giftee_id),
  check (budget_bucket_min <= budget_bucket_max)
);

create index matches_event_santa_idx  on matches (event_id, santa_id);
create index matches_event_giftee_idx on matches (event_id, giftee_id);

-- Gift suggestions (cache for Anthropic API calls)
create table gift_suggestions (
  id                uuid primary key default gen_random_uuid(),
  match_id          uuid not null references matches(id) on delete cascade,
  suggestions_json  jsonb not null,
  generated_at      timestamptz not null default now(),
  generation_count  integer not null default 1 check (generation_count >= 1)
);

create index gift_suggestions_match_idx on gift_suggestions (match_id);

-- Admins — seeded from the ADMIN_EMAILS env var on deploy.
create table admins (
  email citext primary key
);
