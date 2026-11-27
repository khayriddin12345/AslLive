create extension if not exists pgcrypto;

create table if not exists public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 username text unique, full_name text, role text not null default 'buyer' check(role in ('buyer','seller')),
 shop_name text, avatar_url text, country_code text not null default 'UZ', phone text,
 whatsapp_number text, telegram_username text, is_verified boolean not null default false,
 ships_internationally boolean not null default false, created_at timestamptz not null default now()
);
create table if not exists public.products (
 id uuid primary key default gen_random_uuid(), seller_id uuid not null references public.profiles(id) on delete cascade,
 title text not null, description text, price_uzs numeric not null check(price_uzs>=0), price_usd numeric not null check(price_usd>=0),
 discount_price_uzs numeric check(discount_price_uzs is null or discount_price_uzs>=0),
 discount_price_usd numeric check(discount_price_usd is null or discount_price_usd>=0), discount_ends_at timestamptz,
 min_order_qty int not null default 1 check(min_order_qty>=1), in_stock boolean not null default true, created_at timestamptz not null default now()
);
create table if not exists public.posts (
 id uuid primary key default gen_random_uuid(), seller_id uuid not null references public.profiles(id) on delete cascade,
 product_id uuid references public.products(id) on delete set null, media_url text not null,
 media_type text not null check(media_type in ('image','video')), caption text,
 captured_in_app boolean not null default true check(captured_in_app=true), expires_at timestamptz,
 scheduled_for timestamptz, created_at timestamptz not null default now()
);
create table if not exists public.live_streams (
 id uuid primary key default gen_random_uuid(), seller_id uuid not null references public.profiles(id) on delete cascade,
 title text not null, room_name text not null unique, pinned_product_id uuid references public.products(id) on delete set null,
 status text not null default 'live' check(status in ('scheduled','live','ended')), scheduled_at timestamptz,
 viewer_count int not null default 0 check(viewer_count>=0), started_at timestamptz, ended_at timestamptz,
 created_at timestamptz not null default now()
);
create table if not exists public.live_messages (
 id uuid primary key default gen_random_uuid(), stream_id uuid not null references public.live_streams(id) on delete cascade,
 user_id uuid not null references public.profiles(id) on delete cascade, message text not null check(length(message) between 1 and 2000),
 created_at timestamptz not null default now()
);
create table if not exists public.orders (
 id uuid primary key default gen_random_uuid(), buyer_id uuid references public.profiles(id) on delete set null,
 seller_id uuid not null references public.profiles(id) on delete cascade, product_id uuid not null references public.products(id) on delete restrict,
 stream_id uuid references public.live_streams(id) on delete set null, quantity int not null default 1 check(quantity>=1),
 total_price numeric not null check(total_price>=0), currency text not null check(currency in ('UZS','USD')),
 delivery_address text not null, buyer_phone text not null, status text not null default 'new' check(status in ('new','confirmed','delivered','cancelled')),
 created_at timestamptz not null default now()
);
create table if not exists public.reminders (
 id uuid primary key default gen_random_uuid(), user_id uuid references public.profiles(id) on delete cascade,
 phone_or_contact text, target_type text not null check(target_type in ('post','live','product')), target_id uuid not null,
 remind_at timestamptz not null, created_at timestamptz not null default now()
);

-- Follows: a user can follow another profile once; self-follow is invalid.
create table if not exists public.follows (
 follower_id uuid not null references public.profiles(id) on delete cascade,
 following_id uuid not null references public.profiles(id) on delete cascade,
 created_at timestamptz not null default now(),
 primary key (follower_id, following_id),
 constraint follows_no_self_follow check (follower_id <> following_id)
);

create index if not exists products_seller_created_idx on public.products(seller_id,created_at desc);
create index if not exists posts_feed_idx on public.posts(created_at desc);
create index if not exists posts_schedule_idx on public.posts(scheduled_for) where scheduled_for is not null;
create index if not exists live_status_schedule_idx on public.live_streams(status,scheduled_at);
create index if not exists live_messages_stream_idx on public.live_messages(stream_id,created_at);
create index if not exists orders_seller_idx on public.orders(seller_id,created_at desc);
create index if not exists orders_buyer_idx on public.orders(buyer_id,created_at desc);
create index if not exists reminders_user_idx on public.reminders(user_id,remind_at);
create index if not exists follows_following_idx on public.follows(following_id,created_at desc);
create index if not exists follows_follower_idx on public.follows(follower_id,created_at desc);

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.posts enable row level security;
alter table public.live_streams enable row level security;
alter table public.live_messages enable row level security;
alter table public.orders enable row level security;
alter table public.reminders enable row level security;
alter table public.follows enable row level security;

drop policy if exists "profiles public read" on public.profiles;
create policy "profiles public read" on public.profiles for select using(true);
drop policy if exists "profiles self insert" on public.profiles;
create policy "profiles self insert" on public.profiles for insert with check(auth.uid()=id);
drop policy if exists "profiles self update" on public.profiles;
create policy "profiles self update" on public.profiles for update using(auth.uid()=id) with check(auth.uid()=id);
drop policy if exists "products public read" on public.products;
create policy "products public read" on public.products for select using(true);
drop policy if exists "seller products insert" on public.products;
create policy "seller products insert" on public.products for insert with check(auth.uid()=seller_id);
drop policy if exists "seller products update" on public.products;
create policy "seller products update" on public.products for update using(auth.uid()=seller_id) with check(auth.uid()=seller_id);
drop policy if exists "seller products delete" on public.products;
create policy "seller products delete" on public.products for delete using(auth.uid()=seller_id);
drop policy if exists "posts public read" on public.posts;
create policy "posts public read" on public.posts for select using(true);
drop policy if exists "seller captured posts insert" on public.posts;
create policy "seller captured posts insert" on public.posts for insert with check(auth.uid()=seller_id and captured_in_app);
drop policy if exists "seller posts update" on public.posts;
create policy "seller posts update" on public.posts for update using(auth.uid()=seller_id) with check(auth.uid()=seller_id and captured_in_app);
drop policy if exists "seller posts delete" on public.posts;
create policy "seller posts delete" on public.posts for delete using(auth.uid()=seller_id);
drop policy if exists "streams public read" on public.live_streams;
create policy "streams public read" on public.live_streams for select using(true);
drop policy if exists "seller streams insert" on public.live_streams;
create policy "seller streams insert" on public.live_streams for insert with check(auth.uid()=seller_id);
drop policy if exists "seller streams update" on public.live_streams;
create policy "seller streams update" on public.live_streams for update using(auth.uid()=seller_id) with check(auth.uid()=seller_id);
drop policy if exists "seller streams delete" on public.live_streams;
create policy "seller streams delete" on public.live_streams for delete using(auth.uid()=seller_id);
drop policy if exists "chat public read" on public.live_messages;
create policy "chat public read" on public.live_messages for select using(true);
drop policy if exists "authenticated chat send" on public.live_messages;
create policy "authenticated chat send" on public.live_messages for insert with check(auth.uid()=user_id and exists(select 1 from public.live_streams s where s.id=stream_id and s.status='live'));
drop policy if exists "order parties read" on public.orders;
create policy "order parties read" on public.orders for select using(auth.uid()=buyer_id or auth.uid()=seller_id);
drop policy if exists "seller update order" on public.orders;
create policy "seller update order" on public.orders for update using(auth.uid()=seller_id) with check(auth.uid()=seller_id);
drop policy if exists "reminder own read" on public.reminders;
create policy "reminder own read" on public.reminders for select using(auth.uid()=user_id);
drop policy if exists "reminder create" on public.reminders;
create policy "reminder create" on public.reminders for insert with check(user_id is null or user_id=auth.uid());
drop policy if exists "reminder own update" on public.reminders;
create policy "reminder own update" on public.reminders for update using(auth.uid()=user_id) with check(auth.uid()=user_id);
drop policy if exists "reminder own delete" on public.reminders;
create policy "reminder own delete" on public.reminders for delete using(auth.uid()=user_id);

drop policy if exists "follows public read" on public.follows;
create policy "follows public read" on public.follows for select using (true);
drop policy if exists "users follow as themselves" on public.follows;
create policy "users follow as themselves" on public.follows for insert to authenticated
 with check (auth.uid() = follower_id and follower_id <> following_id);
drop policy if exists "users unfollow as themselves" on public.follows;
create policy "users unfollow as themselves" on public.follows for delete to authenticated
 using (auth.uid() = follower_id);

insert into storage.buckets(id,name,public) values('media','media',true) on conflict(id) do update set public=true;
drop policy if exists "media public read" on storage.objects;
create policy "media public read" on storage.objects for select using(bucket_id='media');
drop policy if exists "media user upload" on storage.objects;
create policy "media user upload" on storage.objects for insert to authenticated with check(bucket_id='media' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists "media user update" on storage.objects;
create policy "media user update" on storage.objects for update to authenticated using(bucket_id='media' and (storage.foldername(name))[1]=auth.uid()::text) with check(bucket_id='media' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists "media user delete" on storage.objects;
create policy "media user delete" on storage.objects for delete to authenticated using(bucket_id='media' and (storage.foldername(name))[1]=auth.uid()::text);

do $$ begin
 if exists(select 1 from pg_publication where pubname='supabase_realtime') and not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='live_messages') then
  alter publication supabase_realtime add table public.live_messages;
 end if;
end $$;

create or replace function public.create_profile_for_new_user()
returns trigger language plpgsql security definer set search_path=public as $$
declare requested_role text := coalesce(new.raw_user_meta_data->>'role','buyer');
begin
 if requested_role not in ('buyer','seller') then requested_role := 'buyer'; end if;
 insert into public.profiles(id,username,full_name,role,country_code)
 values(new.id,nullif(lower(trim(new.raw_user_meta_data->>'username')),''),nullif(trim(new.raw_user_meta_data->>'full_name'),''),requested_role,'UZ')
 on conflict(id) do nothing;
 return new;
end $$;
drop trigger if exists auth_user_profile on auth.users;
create trigger auth_user_profile after insert on auth.users for each row execute procedure public.create_profile_for_new_user();
