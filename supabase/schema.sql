-- =============================================
-- VPO Social Integration Platform - DB Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  avatar_url text,
  city text,
  region text,
  origin_city text,
  origin_region text,
  is_vpo boolean default true,
  bio text,
  phone text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view all profiles"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================
-- Chat Rooms
-- =============================================
create table public.rooms (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  is_public boolean default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

alter table public.rooms enable row level security;

create policy "Anyone can view public rooms"
  on public.rooms for select using (is_public = true);

create policy "Authenticated users can create rooms"
  on public.rooms for insert with check (auth.uid() = created_by);

-- Default general room
insert into public.rooms (name, description) values
  ('Загальний чат', 'Загальний чат для всіх користувачів платформи'),
  ('Питання та відповіді', 'Задавайте питання та допомагайте іншим'),
  ('Пошук житла', 'Допомога з пошуком тимчасового та постійного житла'),
  ('Робота та зайнятість', 'Вакансії, підробітки, підприємництво');

-- =============================================
-- Messages (Realtime enabled)
-- =============================================
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  room_id uuid references public.rooms(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

alter table public.messages enable row level security;

create policy "Anyone can read messages in public rooms"
  on public.messages for select
  using (
    exists (
      select 1 from public.rooms
      where rooms.id = messages.room_id and rooms.is_public = true
    )
  );

create policy "Authenticated users can send messages"
  on public.messages for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own messages"
  on public.messages for delete
  using (auth.uid() = user_id);

-- Enable Realtime for messages
alter publication supabase_realtime add table public.messages;

-- =============================================
-- Resources (social services, organizations)
-- =============================================
create table public.resources (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  category text not null, -- 'housing', 'employment', 'medical', 'legal', 'education', 'financial'
  contact_phone text,
  contact_email text,
  website_url text,
  address text,
  city text,
  region text,
  is_verified boolean default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

alter table public.resources enable row level security;

create policy "Anyone can view resources"
  on public.resources for select using (true);

create policy "Authenticated users can add resources"
  on public.resources for insert with check (auth.uid() = created_by);

create policy "Creators can update own resources"
  on public.resources for update using (auth.uid() = created_by);
