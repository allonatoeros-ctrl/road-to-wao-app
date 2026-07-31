-- ==========================================
-- MIGRATION: Private contact email for admin recovery
-- ==========================================
--
-- WHY A NEW TABLE INSTEAD OF profile_secrets.contact_email:
--   profile_secrets already has a "connected users" SELECT policy that lets
--   an approved passenger read their driver's row (and vice versa) so they
--   can see each other's Telegram/Instagram handles. That policy applies to
--   the whole row — there is no column-level RLS in Postgres, so any column
--   added to profile_secrets would be exposed to connected users too, not
--   just the owner and admins as required. Email is more sensitive than a
--   Telegram handle, so it gets its own table with only two read policies:
--   owner and admin. This keeps the existing Telegram-sharing model
--   untouched and satisfies "email non leggibile dagli altri utenti normali"
--   exactly, including connected drivers/passengers.
--
-- Safe to run once against the existing database. Idempotent where possible.
-- ==========================================

create table if not exists public.profile_private_contacts (
  id uuid primary key references public.profiles(id) on delete cascade,
  contact_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profile_private_contacts is
  'Private admin-recovery contact info. Never exposed to anon key, other users, or the public board.';
comment on column public.profile_private_contacts.contact_email is
  'Lowercased/trimmed copy of the auth user email, used only as a Telegram-recovery channel for admins.';

alter table public.profile_private_contacts enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'profile_private_contacts'
      and policyname = 'Allow users to read their own private contact'
  ) then
    create policy "Allow users to read their own private contact"
      on public.profile_private_contacts
      for select
      to authenticated
      using (auth.uid() = id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'profile_private_contacts'
      and policyname = 'Allow admins to read all private contacts'
  ) then
    create policy "Allow admins to read all private contacts"
      on public.profile_private_contacts
      for select
      to authenticated
      using (public.is_admin(auth.uid()));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'profile_private_contacts'
      and policyname = 'Allow users to insert their own private contact'
  ) then
    create policy "Allow users to insert their own private contact"
      on public.profile_private_contacts
      for insert
      to authenticated
      with check (auth.uid() = id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'profile_private_contacts'
      and policyname = 'Allow users to update their own private contact'
  ) then
    create policy "Allow users to update their own private contact"
      on public.profile_private_contacts
      for update
      to authenticated
      using (auth.uid() = id)
      with check (auth.uid() = id);
  end if;
end $$;

drop trigger if exists set_profile_private_contacts_updated_at on public.profile_private_contacts;
create trigger set_profile_private_contacts_updated_at
  before update on public.profile_private_contacts
  for each row execute function public.handle_updated_at();

-- No policy grants select/insert/update to anon: anonymous sessions cannot
-- read or write this table at all, satisfying "email non leggibile con anon key".
