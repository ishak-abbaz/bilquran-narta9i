-- =========================================================
-- Quran books store schema
-- Run first on a NEW Supabase project
-- =========================================================

-- UUID generation
create extension if not exists "pgcrypto";


-- =========================================================
-- Tables
-- =========================================================

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  image_url text,
  sort_order integer default 0,
  created_at timestamptz default now()
);


create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,

  publisher text,
  riwaya text,

  price integer not null,

  category_id uuid
    references public.categories(id)
    on delete restrict,

  images text[] not null default '{}'::text[]
    check (cardinality(images) <= 3),

  stock integer not null default 0
    check (stock >= 0),

  is_featured boolean default false,
  is_active boolean default true,

  created_at timestamptz default now()
);


create table public.orders (
  id uuid primary key default gen_random_uuid(),

  order_number bigint generated always as identity,

  customer_name text not null,
  phone text not null,

  -- Stores the wilaya NAME, not its numeric code.
  wilaya text not null,

  delivery_type text not null
    check (delivery_type in ('home', 'desk')),

  address text not null,
  notes text,

  status text default 'pending'
    check (
      status in (
        'pending',
        'confirmed',
        'shipped',
        'delivered',
        'cancelled'
      )
    ),

  subtotal integer,
  delivery_fee integer,
  total integer,

  created_at timestamptz default now()
);


create table public.order_items (
  id uuid primary key default gen_random_uuid(),

  order_id uuid
    references public.orders(id)
    on delete cascade,

  product_id uuid
    references public.products(id)
    on delete set null,

  product_name text,
  unit_price integer,

  quantity integer not null
    check (quantity > 0)
);


create table public.settings (
  id integer primary key
    default 1
    check (id = 1),

  store_name text,
  phone text,
  email text,
  instagram text,
  address text,

  free_delivery_threshold integer null
);


create table public.delivery_prices (
  wilaya_code integer primary key,
  wilaya_name text not null,
  home_price integer not null,
  desk_price integer not null
);


create table public.admins (
  user_id uuid primary key
    references auth.users(id)
    on delete cascade
);


create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text,
  phone text,
  message text,
  created_at timestamptz default now()
);


-- =========================================================
-- Admin helper
-- =========================================================

create or replace function public.is_admin()
returns boolean
security definer
set search_path = public
language sql
stable
as $$
  select exists (
    select 1
    from public.admins
    where user_id = auth.uid()
  );
$$;


-- =========================================================
-- Indexes
-- =========================================================

create index products_slug_idx
on public.products(slug);

create index products_category_idx
on public.products(category_id);

create index products_is_active_idx
on public.products(is_active);

create index orders_created_at_idx
on public.orders(created_at);

create index orders_status_idx
on public.orders(status);


-- =========================================================
-- Enable RLS
-- =========================================================

alter table public.categories
enable row level security;

alter table public.products
enable row level security;

alter table public.orders
enable row level security;

alter table public.order_items
enable row level security;

alter table public.settings
enable row level security;

alter table public.delivery_prices
enable row level security;

alter table public.admins
enable row level security;

alter table public.contact_messages
enable row level security;


-- =========================================================
-- Categories policies
-- =========================================================

create policy "Public read categories"
on public.categories
for select
using (true);


create policy "Admins manage categories"
on public.categories
for all
using (public.is_admin())
with check (public.is_admin());


-- =========================================================
-- Products policies
-- =========================================================

create policy "Public read active products"
on public.products
for select
using (is_active = true);


create policy "Admins manage products"
on public.products
for all
using (public.is_admin())
with check (public.is_admin());


-- =========================================================
-- Settings policies
-- =========================================================

create policy "Public read settings"
on public.settings
for select
using (true);


create policy "Admins manage settings"
on public.settings
for all
using (public.is_admin())
with check (public.is_admin());


-- =========================================================
-- Delivery policies
-- =========================================================

create policy "Public read delivery prices"
on public.delivery_prices
for select
using (true);


create policy "Admins manage delivery prices"
on public.delivery_prices
for all
using (public.is_admin())
with check (public.is_admin());


-- =========================================================
-- Orders policies
-- No public insert.
-- Orders are created server-side only.
-- =========================================================

create policy "Admins read orders"
on public.orders
for select
using (public.is_admin());


create policy "Admins update orders"
on public.orders
for update
using (public.is_admin())
with check (public.is_admin());


create policy "Admins delete orders"
on public.orders
for delete
using (public.is_admin());


-- =========================================================
-- Order items policies
-- =========================================================

create policy "Admins read order items"
on public.order_items
for select
using (public.is_admin());


create policy "Admins update order items"
on public.order_items
for update
using (public.is_admin())
with check (public.is_admin());


create policy "Admins delete order items"
on public.order_items
for delete
using (public.is_admin());


-- =========================================================
-- Admins policies
-- =========================================================

create policy "Admins read admins"
on public.admins
for select
using (public.is_admin());


create policy "Admins update admins"
on public.admins
for update
using (public.is_admin())
with check (public.is_admin());


create policy "Admins delete admins"
on public.admins
for delete
using (public.is_admin());


-- =========================================================
-- Contact message policies
-- =========================================================

create policy "Anyone can send contact message"
on public.contact_messages
for insert
with check (true);


create policy "Admins read contact messages"
on public.contact_messages
for select
using (public.is_admin());


-- =========================================================
-- Products storage bucket
-- =========================================================

insert into storage.buckets (
  id,
  name,
  public
)
values (
  'products',
  'products',
  true
)
on conflict (id) do nothing;


create policy "Public view product images"
on storage.objects
for select
using (
  bucket_id = 'products'
);


create policy "Admins upload product images"
on storage.objects
for insert
with check (
  bucket_id = 'products'
  and public.is_admin()
);


create policy "Admins update product images"
on storage.objects
for update
using (
  bucket_id = 'products'
  and public.is_admin()
);


create policy "Admins delete product images"
on storage.objects
for delete
using (
  bucket_id = 'products'
  and public.is_admin()
);


-- =========================================================
-- Categories storage bucket
-- Same access model as products.
-- =========================================================

insert into storage.buckets (
  id,
  name,
  public
)
values (
  'categories',
  'categories',
  true
)
on conflict (id) do nothing;


create policy "Public view category images"
on storage.objects
for select
using (
  bucket_id = 'categories'
);


create policy "Admins upload category images"
on storage.objects
for insert
with check (
  bucket_id = 'categories'
  and public.is_admin()
);


create policy "Admins update category images"
on storage.objects
for update
using (
  bucket_id = 'categories'
  and public.is_admin()
);


create policy "Admins delete category images"
on storage.objects
for delete
using (
  bucket_id = 'categories'
  and public.is_admin()
);