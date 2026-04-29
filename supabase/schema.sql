-- =============================================
-- VPO Social Integration Platform
-- Full Database Schema — run in Supabase SQL Editor
-- Safe to re-run: drops existing objects first
-- =============================================

-- =============================================
-- DROP EVERYTHING (reverse dependency order)
-- =============================================
drop trigger  if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user() cascade;
drop function if exists public.get_community_member_count(uuid) cascade;
drop function if exists public.get_event_participant_count(uuid) cascade;
drop function if exists public.is_community_member(uuid, uuid) cascade;
drop function if exists public.is_event_participant(uuid, uuid) cascade;

drop table if exists public.admin_actions      cascade;
drop table if exists public.notifications      cascade;
drop table if exists public.direct_messages    cascade;
drop table if exists public.messages           cascade;
drop table if exists public.rooms              cascade;
drop table if exists public.event_participants cascade;
drop table if exists public.events             cascade;
drop table if exists public.community_posts    cascade;
drop table if exists public.community_members  cascade;
drop table if exists public.communities        cascade;
drop table if exists public.resources          cascade;
drop table if exists public.resource_categories cascade;
drop table if exists public.profiles           cascade;

-- =============================================
-- PROFILES
-- =============================================
create table public.profiles (
  id            uuid references auth.users(id) on delete cascade primary key,
  full_name     text,
  avatar_url    text,
  city          text,
  region        text,
  origin_city   text,
  origin_region text,
  is_vpo        boolean default true,
  bio           text,
  phone         text,
  interests     text[] default '{}',
  role          text default 'user' check (role in ('user', 'admin')),
  status        text default 'active' check (status in ('active', 'blocked')),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================
-- RESOURCE CATEGORIES
-- =============================================
create table public.resource_categories (
  id         uuid default gen_random_uuid() primary key,
  name       text not null unique,
  slug       text not null unique,
  icon       text,
  created_at timestamptz default now()
);

alter table public.resource_categories enable row level security;
create policy "Resource categories are public" on public.resource_categories for select using (true);

insert into public.resource_categories (name, slug, icon) values
  ('Житло', 'housing', '🏠'),
  ('Юридична допомога', 'legal', '⚖️'),
  ('Психологічна підтримка', 'psychology', '🧠'),
  ('Зайнятість', 'employment', '💼'),
  ('Освіта', 'education', '📚'),
  ('Охорона здоров''я', 'healthcare', '🏥'),
  ('Гуманітарна допомога', 'humanitarian', '🤝'),
  ('Фінансова допомога', 'financial', '💰');

-- =============================================
-- RESOURCES
-- =============================================
create table public.resources (
  id             uuid default gen_random_uuid() primary key,
  title          text not null,
  description    text,
  category_id    uuid references public.resource_categories(id) on delete set null,
  contact_phone  text,
  contact_email  text,
  website_url    text,
  address        text,
  city           text,
  region         text,
  is_verified    boolean default false,
  created_by     uuid references public.profiles(id) on delete set null,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

alter table public.resources enable row level security;
create policy "Resources are public"        on public.resources for select using (true);
create policy "Auth users can add resources" on public.resources for insert with check (auth.uid() = created_by);
create policy "Creators can update"          on public.resources for update using (auth.uid() = created_by);
create policy "Creators can delete"          on public.resources for delete using (auth.uid() = created_by);

-- =============================================
-- COMMUNITIES
-- =============================================
create table public.communities (
  id           uuid default gen_random_uuid() primary key,
  name         text not null,
  description  text,
  city         text,
  region       text,
  category     text,
  rules        text,
  image_url    text,
  is_approved  boolean default true,
  created_by   uuid references public.profiles(id) on delete set null,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

alter table public.communities enable row level security;
create policy "Communities are public"           on public.communities for select using (is_approved = true);
create policy "Auth users can create communities" on public.communities for insert with check (auth.uid() = created_by);
create policy "Creators can update communities"   on public.communities for update using (auth.uid() = created_by);
create policy "Creators can delete communities"   on public.communities for delete using (auth.uid() = created_by);

-- =============================================
-- COMMUNITY MEMBERS
-- =============================================
create table public.community_members (
  id           uuid default gen_random_uuid() primary key,
  community_id uuid references public.communities(id) on delete cascade not null,
  user_id      uuid references public.profiles(id) on delete cascade not null,
  role         text default 'member' check (role in ('member', 'moderator', 'admin')),
  joined_at    timestamptz default now(),
  unique(community_id, user_id)
);

alter table public.community_members enable row level security;
create policy "Members are public"           on public.community_members for select using (true);
create policy "Auth users can join"          on public.community_members for insert with check (auth.uid() = user_id);
create policy "Members can leave"            on public.community_members for delete using (auth.uid() = user_id);

-- =============================================
-- COMMUNITY ANNOUNCEMENTS
-- =============================================
create table public.community_posts (
  id           uuid default gen_random_uuid() primary key,
  community_id uuid references public.communities(id) on delete cascade not null,
  author_id    uuid references public.profiles(id) on delete cascade not null,
  content      text not null,
  created_at   timestamptz default now()
);

alter table public.community_posts enable row level security;
create policy "Posts are public"       on public.community_posts for select using (true);
create policy "Members can post"       on public.community_posts for insert with check (auth.uid() = author_id);
create policy "Authors can delete"     on public.community_posts for delete using (auth.uid() = author_id);

-- =============================================
-- EVENTS
-- =============================================
create table public.events (
  id                uuid default gen_random_uuid() primary key,
  title             text not null,
  description       text,
  city              text,
  region            text,
  address           text,
  online_link       text,
  format            text default 'offline' check (format in ('online', 'offline', 'hybrid')),
  category          text,
  image_url         text,
  starts_at         timestamptz not null,
  ends_at           timestamptz,
  max_participants  int,
  community_id      uuid references public.communities(id) on delete set null,
  organizer_id      uuid references public.profiles(id) on delete set null,
  is_approved       boolean default true,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

alter table public.events enable row level security;
create policy "Events are public"          on public.events for select using (is_approved = true);
create policy "Auth users can create"      on public.events for insert with check (auth.uid() = organizer_id);
create policy "Organizers can update"      on public.events for update using (auth.uid() = organizer_id);
create policy "Organizers can delete"      on public.events for delete using (auth.uid() = organizer_id);

-- =============================================
-- EVENT PARTICIPANTS
-- =============================================
create table public.event_participants (
  id         uuid default gen_random_uuid() primary key,
  event_id   uuid references public.events(id) on delete cascade not null,
  user_id    uuid references public.profiles(id) on delete cascade not null,
  registered_at timestamptz default now(),
  unique(event_id, user_id)
);

alter table public.event_participants enable row level security;
create policy "Participants are public"      on public.event_participants for select using (true);
create policy "Auth users can register"      on public.event_participants for insert with check (auth.uid() = user_id);
create policy "Users can unregister"         on public.event_participants for delete using (auth.uid() = user_id);

-- =============================================
-- CHAT ROOMS
-- =============================================
create table public.rooms (
  id           uuid default gen_random_uuid() primary key,
  name         text not null,
  description  text,
  is_public    boolean default true,
  created_by   uuid references public.profiles(id) on delete set null,
  created_at   timestamptz default now()
);

alter table public.rooms enable row level security;
create policy "Public rooms are viewable"  on public.rooms for select using (is_public = true);
create policy "Auth users can create rooms" on public.rooms for insert with check (auth.uid() = created_by);

insert into public.rooms (name, description) values
  ('Загальний чат',        'Загальний чат для всіх користувачів'),
  ('Питання та відповіді', 'Задавайте питання та допомагайте іншим'),
  ('Пошук житла',          'Допомога з пошуком житла'),
  ('Робота та зайнятість', 'Вакансії та підробітки');

-- =============================================
-- MESSAGES
-- =============================================
create table public.messages (
  id         uuid default gen_random_uuid() primary key,
  room_id    uuid references public.rooms(id) on delete cascade not null,
  user_id    uuid references public.profiles(id) on delete cascade not null,
  content    text not null,
  is_read    boolean default false,
  created_at timestamptz default now()
);

alter table public.messages enable row level security;
create policy "Auth users can read messages" on public.messages for select using (auth.uid() is not null);
create policy "Auth users can send messages" on public.messages for insert with check (auth.uid() = user_id);
create policy "Users can delete own messages" on public.messages for delete using (auth.uid() = user_id);

alter publication supabase_realtime add table public.messages;

-- =============================================
-- DIRECT MESSAGES
-- =============================================
create table public.direct_messages (
  id          uuid default gen_random_uuid() primary key,
  sender_id   uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  content     text not null,
  is_read     boolean default false,
  created_at  timestamptz default now()
);

alter table public.direct_messages enable row level security;
create policy "Users can view their own DMs"
  on public.direct_messages for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "Auth users can send DMs"
  on public.direct_messages for insert with check (auth.uid() = sender_id);
create policy "Users can mark DMs as read"
  on public.direct_messages for update
  using (auth.uid() = receiver_id);

alter publication supabase_realtime add table public.direct_messages;

-- =============================================
-- NOTIFICATIONS
-- =============================================
create table public.notifications (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references public.profiles(id) on delete cascade not null,
  type       text not null, -- 'message', 'event', 'community', 'admin'
  title      text not null,
  body       text,
  link       text,
  is_read    boolean default false,
  created_at timestamptz default now()
);

alter table public.notifications enable row level security;
create policy "Users can view own notifications"
  on public.notifications for select using (auth.uid() = user_id);
create policy "Users can mark as read"
  on public.notifications for update using (auth.uid() = user_id);

alter publication supabase_realtime add table public.notifications;

-- =============================================
-- ADMIN ACTIONS LOG
-- =============================================
create table public.admin_actions (
  id          uuid default gen_random_uuid() primary key,
  admin_id    uuid references public.profiles(id) on delete set null,
  action_type text not null,
  target_type text,
  target_id   uuid,
  description text,
  created_at  timestamptz default now()
);

alter table public.admin_actions enable row level security;
create policy "Admins can view actions"
  on public.admin_actions for select
  using (exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));
create policy "Admins can insert actions"
  on public.admin_actions for insert
  with check (exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

-- =============================================
-- GRANTS
-- =============================================
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;
alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public
  grant select on tables to anon;

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Count community members
create or replace function public.get_community_member_count(community_uuid uuid)
returns bigint as $$
  select count(*) from public.community_members where community_id = community_uuid;
$$ language sql stable;

-- Count event participants
create or replace function public.get_event_participant_count(event_uuid uuid)
returns bigint as $$
  select count(*) from public.event_participants where event_id = event_uuid;
$$ language sql stable;

-- Check if user is member of community
create or replace function public.is_community_member(community_uuid uuid, user_uuid uuid)
returns boolean as $$
  select exists (
    select 1 from public.community_members
    where community_id = community_uuid and user_id = user_uuid
  );
$$ language sql stable;

-- Check if user is registered for event
create or replace function public.is_event_participant(event_uuid uuid, user_uuid uuid)
returns boolean as $$
  select exists (
    select 1 from public.event_participants
    where event_id = event_uuid and user_id = user_uuid
  );
$$ language sql stable;
