-- ==========================================
-- ROAD TO WAO - SUPABASE SQL SCHEMA (v1.0-MVP)
-- ==========================================
--
-- DESCRIPTION:
--   First-release draft database schema for the Road to WAO real-user MVP.
--   Designed for Profile Lite, public browsing, and authenticated actions.
--
-- WARNING & PRODUCTION REVIEW ITEMS:
--   1. This SQL is a FIRST RELEASE DRAFT. It is not a final production security guarantee.
--   2. RLS policies must undergo thorough penetration testing and audit prior to official launch.
--   3. An automatic trigger or webhook to synchronize Supabase Auth (auth.users) inserts into public.profiles
--      is recommended for production, but omitted here for a simple Profile Lite flow (letting client perform insert).
--   4. The `is_admin` field on public.profiles is used for simplicity. In production, a separate roles table or
--      custom claims (using pg_net or custom triggers) is recommended to prevent users from self-promoting.
--   5. Realtime replication should be strictly limited to the required tables in Supabase dashboard.
--
-- ==========================================

-- Enable UUID extension if not enabled
create extension if not exists "uuid-ossp";

-- ==========================================
-- 1. DATABASE TABLES
-- ==========================================

-- TABLE: profiles
-- Profile Lite schema linked directly to Supabase Auth user accounts.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null,
  departure_city text,
  telegram_username text,
  instagram_username text,
  role text,
  is_of_age boolean not null,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- TABLE: rides
-- Offered rides that appear in the Road Board.
create table public.rides (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references public.profiles(id) on delete cascade,
  departure_city text not null,
  departure_area text,
  to_event text not null default 'WAO Festival',
  departure_date text,
  return_date text,
  seats_total integer not null check (seats_total > 0),
  seats_available integer not null check (seats_available >= 0),
  departure_time_label text not null,
  vibe text,
  notes text,
  status text not null default 'open' check (status in ('open', 'full', 'cancelled', 'archived')),
  visibility text not null default 'public' check (visibility in ('public', 'hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- TABLE: ride_secrets
-- Secure private data for rides, separating sensitive data (Telegram link) from public browsing.
create table public.ride_secrets (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid unique not null references public.rides(id) on delete cascade,
  telegram_group_link text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- TABLE: join_requests
-- Requests to join a specific ride.
create table public.join_requests (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid not null references public.rides(id) on delete cascade,
  requester_id uuid not null references public.profiles(id) on delete cascade,
  seats_requested integer not null default 1 check (seats_requested > 0),
  message text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'cancelled')),
  approved_at timestamptz,
  rejected_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- TABLE: general_requests
-- General travel requests that do not target a specific ride.
create table public.general_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  from_city text not null,
  from_area text,
  people_count integer not null default 1 check (people_count > 0),
  message text,
  status text not null default 'active' check (status in ('active', 'archived', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- TABLE: moderation_events
-- Audit log of actions performed by administrators.
create table public.moderation_events (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references public.profiles(id) on delete set null,
  target_type text not null check (target_type in ('ride', 'join_request', 'general_request', 'profile')),
  target_id uuid not null,
  action text not null,
  note text,
  created_at timestamptz not null default now()
);

-- ==========================================
-- 2. HELPER FUNCTIONS & TRIGGERS
-- ==========================================

-- Trigger function to automatically update the updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Register triggers for automatic updated_at updates
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger set_rides_updated_at
  before update on public.rides
  for each row execute function public.handle_updated_at();

create trigger set_ride_secrets_updated_at
  before update on public.ride_secrets
  for each row execute function public.handle_updated_at();

create trigger set_join_requests_updated_at
  before update on public.join_requests
  for each row execute function public.handle_updated_at();

create trigger set_general_requests_updated_at
  before update on public.general_requests
  for each row execute function public.handle_updated_at();

-- Security Definer function to check admin privileges without infinite RLS recursion on the profiles table
create or replace function public.is_admin(user_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = user_id and is_admin = true
  );
end;
$$ language plpgsql security definer;

-- ==========================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable Row Level Security on all tables
alter table public.profiles enable row level security;
alter table public.rides enable row level security;
alter table public.ride_secrets enable row level security;
alter table public.join_requests enable row level security;
alter table public.general_requests enable row level security;
alter table public.moderation_events enable row level security;

-- ------------------------------------------
-- PROFILES POLICIES
-- ------------------------------------------

create policy "Allow users to read their own profile"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

create policy "Allow admins to read all profiles"
  on public.profiles
  for select
  to authenticated
  using (public.is_admin(auth.uid()));

create policy "Allow users to insert their own profile"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

create policy "Allow users to update their own profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Allow admins to update all profiles"
  on public.profiles
  for update
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ------------------------------------------
-- RIDES POLICIES
-- ------------------------------------------

-- Browsing rides is public; anyone can view visible/non-hidden rides.
create policy "Allow anyone to read public rides"
  on public.rides
  for select
  using (visibility = 'public');

-- Drivers can see their own hidden rides.
create policy "Allow drivers to read their own rides"
  on public.rides
  for select
  to authenticated
  using (auth.uid() = driver_id);

-- Admins can read all rides.
create policy "Allow admins to read all rides"
  on public.rides
  for select
  to authenticated
  using (public.is_admin(auth.uid()));

create policy "Allow authenticated users to create rides"
  on public.rides
  for insert
  to authenticated
  with check (auth.uid() = driver_id);

create policy "Allow drivers to update their own rides"
  on public.rides
  for update
  to authenticated
  using (auth.uid() = driver_id)
  with check (auth.uid() = driver_id);

create policy "Allow admins to update any ride"
  on public.rides
  for update
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create policy "Allow admins to delete rides"
  on public.rides
  for delete
  to authenticated
  using (public.is_admin(auth.uid()));

-- ------------------------------------------
-- RIDE SECRETS POLICIES
-- ------------------------------------------

-- No anonymous access is possible since there's no policy permitting 'anon'.
-- All policies require authenticated role.

create policy "Allow drivers, approved users, and admins to select secrets"
  on public.ride_secrets
  for select
  to authenticated
  using (
    -- Driver of the ride can read it
    auth.uid() = (select driver_id from public.rides where id = ride_id)
    or
    -- Approved requester can read it (has an approved join request for this ride)
    exists (
      select 1 from public.join_requests
      where ride_id = ride_secrets.ride_id
        and requester_id = auth.uid()
        and status = 'approved'
    )
    or
    -- Admin can read it
    public.is_admin(auth.uid())
  );

create policy "Allow drivers and admins to insert secrets"
  on public.ride_secrets
  for insert
  to authenticated
  with check (
    auth.uid() = (select driver_id from public.rides where id = ride_id)
    or
    public.is_admin(auth.uid())
  );

create policy "Allow drivers and admins to update secrets"
  on public.ride_secrets
  for update
  to authenticated
  using (
    auth.uid() = (select driver_id from public.rides where id = ride_id)
    or
    public.is_admin(auth.uid())
  )
  with check (
    auth.uid() = (select driver_id from public.rides where id = ride_id)
    or
    public.is_admin(auth.uid())
  );

create policy "Allow admins to delete secrets"
  on public.ride_secrets
  for delete
  to authenticated
  using (public.is_admin(auth.uid()));

-- ------------------------------------------
-- JOIN REQUESTS POLICIES
-- ------------------------------------------

create policy "Allow requesters to view their own join requests"
  on public.join_requests
  for select
  to authenticated
  using (auth.uid() = requester_id);

create policy "Allow drivers to view join requests for their rides"
  on public.join_requests
  for select
  to authenticated
  using (auth.uid() = (select driver_id from public.rides where id = ride_id));

create policy "Allow admins to view all join requests"
  on public.join_requests
  for select
  to authenticated
  using (public.is_admin(auth.uid()));

create policy "Allow authenticated users to create join requests for themselves"
  on public.join_requests
  for insert
  to authenticated
  with check (auth.uid() = requester_id);

create policy "Allow requesters to update/cancel their own pending requests"
  on public.join_requests
  for update
  to authenticated
  using (auth.uid() = requester_id)
  with check (auth.uid() = requester_id and status in ('pending', 'cancelled'));

create policy "Allow drivers to update status of join requests for their rides"
  on public.join_requests
  for update
  to authenticated
  using (auth.uid() = (select driver_id from public.rides where id = ride_id))
  with check (auth.uid() = (select driver_id from public.rides where id = ride_id));

create policy "Allow admins to update any join request"
  on public.join_requests
  for update
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create policy "Allow admins to delete join requests"
  on public.join_requests
  for delete
  to authenticated
  using (public.is_admin(auth.uid()));

-- ------------------------------------------
-- GENERAL REQUESTS POLICIES
-- ------------------------------------------

create policy "Allow requesters to view their own general requests"
  on public.general_requests
  for select
  to authenticated
  using (auth.uid() = requester_id);

create policy "Allow admins to view all general requests"
  on public.general_requests
  for select
  to authenticated
  using (public.is_admin(auth.uid()));

create policy "Allow authenticated users to create general requests for themselves"
  on public.general_requests
  for insert
  to authenticated
  with check (auth.uid() = requester_id);

create policy "Allow requesters to update/cancel their own general requests"
  on public.general_requests
  for update
  to authenticated
  using (auth.uid() = requester_id)
  with check (auth.uid() = requester_id);

create policy "Allow admins to update any general request"
  on public.general_requests
  for update
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create policy "Allow admins to delete general requests"
  on public.general_requests
  for delete
  to authenticated
  using (public.is_admin(auth.uid()));

-- ------------------------------------------
-- MODERATION EVENTS POLICIES
-- ------------------------------------------

create policy "Allow admins to read moderation events"
  on public.moderation_events
  for select
  to authenticated
  using (public.is_admin(auth.uid()));

create policy "Allow admins to insert moderation events"
  on public.moderation_events
  for insert
  to authenticated
  with check (public.is_admin(auth.uid()));

-- ==========================================
-- 4. PERFORMANCE INDEXES
-- ==========================================

-- Index foreign keys for faster joins
create index idx_rides_driver_id on public.rides (driver_id);
create index idx_ride_secrets_ride_id on public.ride_secrets (ride_id);
create index idx_join_requests_ride_id on public.join_requests (ride_id);
create index idx_join_requests_requester_id on public.join_requests (requester_id);
create index idx_general_requests_requester_id on public.general_requests (requester_id);
create index idx_moderation_events_admin_id on public.moderation_events (admin_id);

-- Index frequently queried status/visibility fields
create index idx_rides_status_visibility on public.rides (status, visibility);
create index idx_join_requests_status on public.join_requests (status);
create index idx_general_requests_status on public.general_requests (status);
