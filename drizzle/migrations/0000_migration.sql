create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "Users read own roles" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

-- Bootstrap: the first signed-in user may claim admin only while no admin exists.
create or replace function public.claim_first_admin()
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return false; end if;
  perform pg_advisory_xact_lock(424242);
  if exists (select 1 from public.user_roles where role = 'admin') then return false; end if;
  insert into public.user_roles (user_id, role) values (auth.uid(), 'admin');
  return true;
end $$;
revoke all on function public.claim_first_admin() from public, anon;
grant execute on function public.claim_first_admin() to authenticated;

create or replace function public.admin_exists()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where role = 'admin')
$$;
grant execute on function public.admin_exists() to anon, authenticated;

create table public.menu_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  price_labels text[] not null default '{}',
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.menu_categories to anon, authenticated;
grant insert, update, delete on public.menu_categories to authenticated;
grant all on public.menu_categories to service_role;
alter table public.menu_categories enable row level security;
create policy "Public read active categories" on public.menu_categories for select to anon, authenticated
  using (is_active or public.has_role(auth.uid(), 'admin'));
create policy "Admins manage categories" on public.menu_categories for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.menu_categories(id) on delete cascade,
  name text not null,
  description text,
  prices numeric[] not null default '{}',
  is_available boolean not null default true,
  is_featured boolean not null default false,
  image_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.menu_items to anon, authenticated;
grant insert, update, delete on public.menu_items to authenticated;
grant all on public.menu_items to service_role;
alter table public.menu_items enable row level security;
create policy "Public read menu items" on public.menu_items for select to anon, authenticated using (true);
create policy "Admins manage items" on public.menu_items for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create table public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  alt text not null default '',
  caption text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.gallery_images to anon, authenticated;
grant insert, update, delete on public.gallery_images to authenticated;
grant all on public.gallery_images to service_role;
alter table public.gallery_images enable row level security;
create policy "Public read active gallery" on public.gallery_images for select to anon, authenticated
  using (is_active or public.has_role(auth.uid(), 'admin'));
create policy "Admins manage gallery" on public.gallery_images for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create table public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
grant select on public.site_settings to anon, authenticated;
grant insert, update, delete on public.site_settings to authenticated;
grant all on public.site_settings to service_role;
alter table public.site_settings enable row level security;
create policy "Public read settings" on public.site_settings for select to anon, authenticated using (true);
create policy "Admins manage settings" on public.site_settings for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'contact',
  name text not null,
  phone text,
  message text,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'new',
  created_at timestamptz not null default now(),
  constraint enquiries_kind_chk check (kind in ('contact','cake','order')),
  constraint enquiries_name_len check (char_length(name) between 1 and 120),
  constraint enquiries_msg_len check (message is null or char_length(message) <= 2000)
);
grant insert on public.enquiries to anon, authenticated;
grant select, update, delete on public.enquiries to authenticated;
grant all on public.enquiries to service_role;
alter table public.enquiries enable row level security;
create policy "Anyone can submit enquiry" on public.enquiries for insert to anon, authenticated
  with check (status = 'new');
create policy "Admins read enquiries" on public.enquiries for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));
create policy "Admins update enquiries" on public.enquiries for update to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins delete enquiries" on public.enquiries for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));

insert into public.site_settings (key, value) values
  ('announcement', '{"text": "", "active": false}'::jsonb),
  ('hours', '{"text": "Hours shown on our Google profile: closes 10 pm. Please call to confirm today''s timings."}'::jsonb);