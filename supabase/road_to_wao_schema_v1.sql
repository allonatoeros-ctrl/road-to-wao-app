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
  role text,
  is_of_age boolean not null,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- TABLE: profile_secrets
-- Secure private contact data for profiles, separating sensitive data (Telegram/Instagram username) from public browsing.
create table public.profile_secrets (
  id uuid primary key references public.profiles(id) on delete cascade,
  telegram_username text not null,
  instagram_username text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- TABLE: profile_private_contacts
-- Private admin-recovery email, isolated from profile_secrets on purpose: the
-- "connected users" policy on profile_secrets shares Telegram/Instagram between
-- driver and approved passengers, and column-level RLS does not exist in Postgres.
-- Splitting email into its own table keeps it visible to the owner and admins only.
-- See supabase/migrations/002_add_profile_private_contacts.sql for the policies.
create table public.profile_private_contacts (
  id uuid primary key references public.profiles(id) on delete cascade,
  contact_email text,
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
  seats_available integer not null check (seats_available >= 0 and seats_available <= seats_total),
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
  departure_date text,
  return_date text,
  departure_time_label text,
  people_count integer not null default 1 check (people_count > 0),
  message text,
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'matched_manually', 'archived', 'cancelled')),
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

create trigger set_profile_secrets_updated_at
  before update on public.profile_secrets
  for each row execute function public.handle_updated_at();

create trigger set_profile_private_contacts_updated_at
  before update on public.profile_private_contacts
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
    select 1 from public.profiles p
    where p.id = user_id and p.is_admin = true
  );
end;
$$ language plpgsql security definer set search_path = public;

-- Prevent admin self-promotion during updates
create or replace function public.check_profile_update()
returns trigger as $$
begin
  if old.is_admin <> new.is_admin then
    if auth.uid() is not null and not public.is_admin(auth.uid()) then
      raise exception 'Only administrators can modify the is_admin status.';
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger enforce_profile_admin_protection
  before update on public.profiles
  for each row execute function public.check_profile_update();

-- Protect join_requests immutable fields from driver tampering
create or replace function public.check_join_request_immutability()
returns trigger as $$
begin
  if (old.requester_id <> new.requester_id) or
     (old.ride_id <> new.ride_id) or
     (old.seats_requested <> new.seats_requested) or
     (old.message is distinct from new.message) then
    
    if auth.uid() is not null and not public.is_admin(auth.uid()) then
      raise exception 'The fields requester_id, ride_id, seats_requested, and message are read-only after creation.';
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger enforce_join_request_immutability
  before update on public.join_requests
  for each row execute function public.check_join_request_immutability();

-- Handle automatic seats management on rides based on join requests
create or replace function public.handle_join_request_seats()
returns trigger as $$
declare
  v_seats_available integer;
  v_seats_requested integer;
begin
  if TG_OP = 'INSERT' then
    if new.status = 'approved' then
      v_seats_requested := new.seats_requested;
    else
      v_seats_requested := 0;
    end if;
  elsif TG_OP = 'UPDATE' then
    if old.status = 'approved' and new.status = 'approved' then
      v_seats_requested := new.seats_requested - old.seats_requested;
    elsif new.status = 'approved' then
      v_seats_requested := new.seats_requested;
    elsif old.status = 'approved' then
      v_seats_requested := -old.seats_requested;
    else
      v_seats_requested := 0;
    end if;
  elsif TG_OP = 'DELETE' then
    if old.status = 'approved' then
      v_seats_requested := -old.seats_requested;
    else
      v_seats_requested := 0;
    end if;
  end if;

  if v_seats_requested <> 0 then
    -- Serialize concurrent updates using FOR UPDATE
    select r.seats_available into v_seats_available
    from public.rides r
    where r.id = coalesce(new.ride_id, old.ride_id)
    for update;

    if v_seats_requested > v_seats_available then
      raise exception 'Insufficient available seats on this ride (Requested: %, Available: %).', 
        v_seats_requested, v_seats_available;
    end if;

    update public.rides r
    set seats_available = r.seats_available - v_seats_requested
    where r.id = coalesce(new.ride_id, old.ride_id);
  end if;

  if TG_OP = 'DELETE' then
    return old;
  else
    return new;
  end if;
end;
$$ language plpgsql security definer set search_path = public;

create trigger sync_join_request_seats
  after insert or update or delete on public.join_requests
  for each row execute function public.handle_join_request_seats();

-- Prevent drivers from manually desyncing rides.seats_available
create or replace function public.check_ride_seats_consistency()
returns trigger as $$
declare
  v_approved_seats integer;
begin
  -- Keep checks preventing seats_available < 0 and seats_available > seats_total
  if new.seats_available < 0 then
    raise exception 'Seats available cannot be negative.';
  end if;
  if new.seats_available > new.seats_total then
    raise exception 'Seats available cannot exceed total seats.';
  end if;

  -- Allow bypass for auth.uid() IS NULL / SQL Editor / service_role
  -- Admins can update if needed
  if auth.uid() is not null and not public.is_admin(auth.uid()) then
    -- Only enforce consistency if seats_available or seats_total is modified
    if (old.seats_available is distinct from new.seats_available) or 
       (old.seats_total is distinct from new.seats_total) then
      
      select coalesce(sum(jr.seats_requested), 0) into v_approved_seats
      from public.join_requests jr
      where jr.ride_id = new.id and jr.status = 'approved';

      if new.seats_available <> (new.seats_total - v_approved_seats) then
        raise exception 'Seats available (%) must match seats total (%) minus approved requested seats (%).',
          new.seats_available, new.seats_total, v_approved_seats;
      end if;
    end if;
  end if;
  
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger enforce_ride_seats_consistency
  before update on public.rides
  for each row execute function public.check_ride_seats_consistency();

-- ==========================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable Row Level Security on all tables
alter table public.profiles enable row level security;
alter table public.profile_secrets enable row level security;
alter table public.profile_private_contacts enable row level security;
alter table public.rides enable row level security;
alter table public.ride_secrets enable row level security;
alter table public.join_requests enable row level security;
alter table public.general_requests enable row level security;
alter table public.moderation_events enable row level security;

-- ------------------------------------------
-- PROFILES POLICIES
-- ------------------------------------------

create policy "Allow anyone to read profiles"
  on public.profiles
  for select
  using (true);

create policy "Allow users to insert their own profile"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id and is_admin = false);

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
-- PROFILE SECRETS POLICIES
-- ------------------------------------------

create policy "Allow users to read their own profile secrets"
  on public.profile_secrets
  for select
  to authenticated
  using (auth.uid() = id);

create policy "Allow admins to read all profile secrets"
  on public.profile_secrets
  for select
  to authenticated
  using (public.is_admin(auth.uid()));

create policy "Allow connected users to read profile secrets"
  on public.profile_secrets
  for select
  to authenticated
  using (
    -- Approved passenger reading driver contact
    exists (
      select 1 from public.join_requests jr
      join public.rides r on jr.ride_id = r.id
      where r.driver_id = profile_secrets.id 
        and jr.requester_id = auth.uid() 
        and jr.status = 'approved'
    )
    or
    -- Driver reading approved passenger contact
    exists (
      select 1 from public.join_requests jr
      join public.rides r on jr.ride_id = r.id
      where jr.requester_id = profile_secrets.id 
        and r.driver_id = auth.uid() 
        and jr.status = 'approved'
    )
  );

create policy "Allow users to insert their own profile secrets"
  on public.profile_secrets
  for insert
  to authenticated
  with check (auth.uid() = id);

create policy "Allow users to update their own profile secrets"
  on public.profile_secrets
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ------------------------------------------
-- PROFILE PRIVATE CONTACTS POLICIES (owner + admin only, no connected-user sharing)
-- ------------------------------------------

create policy "Allow users to read their own private contact"
  on public.profile_private_contacts
  for select
  to authenticated
  using (auth.uid() = id);

create policy "Allow admins to read all private contacts"
  on public.profile_private_contacts
  for select
  to authenticated
  using (public.is_admin(auth.uid()));

create policy "Allow users to insert their own private contact"
  on public.profile_private_contacts
  for insert
  to authenticated
  with check (auth.uid() = id);

create policy "Allow users to update their own private contact"
  on public.profile_private_contacts
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

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
    auth.uid() = (select r.driver_id from public.rides r where r.id = ride_secrets.ride_id)
    or
    -- Approved requester can read it (has an approved join request for this ride)
    exists (
      select 1 from public.join_requests jr
      where jr.ride_id = ride_secrets.ride_id
        and jr.requester_id = auth.uid()
        and jr.status = 'approved'
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
    auth.uid() = (select r.driver_id from public.rides r where r.id = ride_secrets.ride_id)
    or
    public.is_admin(auth.uid())
  );

create policy "Allow drivers and admins to update secrets"
  on public.ride_secrets
  for update
  to authenticated
  using (
    auth.uid() = (select r.driver_id from public.rides r where r.id = ride_secrets.ride_id)
    or
    public.is_admin(auth.uid())
  )
  with check (
    auth.uid() = (select r.driver_id from public.rides r where r.id = ride_secrets.ride_id)
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
  using (auth.uid() = (select r.driver_id from public.rides r where r.id = join_requests.ride_id));

create policy "Allow admins to view all join requests"
  on public.join_requests
  for select
  to authenticated
  using (public.is_admin(auth.uid()));

create policy "Allow authenticated users to create join requests for themselves"
  on public.join_requests
  for insert
  to authenticated
  with check (
    auth.uid() = requester_id
    and status = 'pending'
    and requester_id <> (select r.driver_id from public.rides r where r.id = join_requests.ride_id)
  );

create policy "Allow requesters to update/cancel their own pending requests"
  on public.join_requests
  for update
  to authenticated
  using (auth.uid() = requester_id and status = 'pending')
  with check (auth.uid() = requester_id and status in ('pending', 'cancelled'));

create policy "Allow requesters to cancel their own approved requests"
  on public.join_requests
  for update
  to authenticated
  using (auth.uid() = requester_id and status = 'approved')
  with check (auth.uid() = requester_id and status = 'cancelled');

create policy "Allow drivers to update status of join requests for their rides"
  on public.join_requests
  for update
  to authenticated
  using (auth.uid() = (select r.driver_id from public.rides r where r.id = join_requests.ride_id))
  with check (auth.uid() = (select r.driver_id from public.rides r where r.id = join_requests.ride_id));

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
create index idx_join_requests_ride_id on public.join_requests (ride_id);
create index idx_join_requests_requester_id on public.join_requests (requester_id);
create index idx_general_requests_requester_id on public.general_requests (requester_id);
create index idx_moderation_events_admin_id on public.moderation_events (admin_id);

-- Index frequently queried status/visibility fields
create index idx_rides_status_visibility on public.rides (status, visibility);
create index idx_join_requests_status on public.join_requests (status);
create index idx_general_requests_status on public.general_requests (status);

-- Composite index for fast lookup of approved/pending join requests
create index idx_join_requests_lookup on public.join_requests (ride_id, requester_id, status);

-- Unique index to prevent duplicate active join requests
create unique index idx_join_requests_active_unique on public.join_requests (ride_id, requester_id) where (status in ('pending', 'approved'));
