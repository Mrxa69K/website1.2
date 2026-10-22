-- 004: booking orders sent from the "order envelope" on the homepage.
--
-- Visitors (anon key) can only INSERT a new order, never read one back.
-- Only the site owner (the account(s) listed in admin_users) can read,
-- update or delete orders from the admin page. Being merely "logged in"
-- is not enough, so an accidental public sign-up could never see clients'
-- names, emails or phone numbers.

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  added_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;
-- no policies on admin_users: nobody can read or change it through the API.

-- Seed: the project currently has exactly one account (the site owner).
insert into public.admin_users (user_id)
select id from auth.users
where (select count(*) from auth.users) = 1
on conflict do nothing;

create or replace function public.is_site_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admin_users where user_id = (select auth.uid()));
$$;
revoke all on function public.is_site_admin() from public;
grant execute on function public.is_site_admin() to anon, authenticated;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  session text not null,
  name text not null,
  contact text not null,
  preferred_date date,
  language text,
  message text,
  site_lang text,
  status text not null default 'new',
  constraint orders_status_check check (status in ('new', 'replied', 'booked', 'archived')),
  constraint orders_lengths_check check (
    char_length(session) between 1 and 100
    and char_length(name) between 1 and 120
    and char_length(contact) between 3 and 200
    and char_length(coalesce(message, '')) <= 4000
    and char_length(coalesce(language, '')) <= 40
    and char_length(coalesce(site_lang, '')) <= 5
  )
);
create index if not exists orders_created_at_idx on public.orders (created_at desc);
alter table public.orders enable row level security;

drop policy if exists "Visitors can send an order" on public.orders;
create policy "Visitors can send an order" on public.orders
  for insert to anon, authenticated
  with check (status = 'new');

drop policy if exists "Owner reads orders" on public.orders;
create policy "Owner reads orders" on public.orders
  for select to authenticated using ((select public.is_site_admin()));

drop policy if exists "Owner updates orders" on public.orders;
create policy "Owner updates orders" on public.orders
  for update to authenticated using ((select public.is_site_admin())) with check ((select public.is_site_admin()));

drop policy if exists "Owner deletes orders" on public.orders;
create policy "Owner deletes orders" on public.orders
  for delete to authenticated using ((select public.is_site_admin()));

grant insert on public.orders to anon, authenticated;
grant select, update, delete on public.orders to authenticated;
