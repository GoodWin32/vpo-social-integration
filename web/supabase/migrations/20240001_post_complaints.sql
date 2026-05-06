-- post_complaints table
-- Run this in Supabase SQL editor

create table if not exists post_complaints (
  id            uuid        primary key default gen_random_uuid(),
  post_id       uuid        not null references community_posts(id) on delete cascade,
  reporter_id   uuid        not null references profiles(id) on delete cascade,
  reason        text        not null check (reason in ('spam', 'harassment', 'misinformation', 'inappropriate', 'other')),
  comment       text,
  status        text        not null default 'pending' check (status in ('pending', 'reviewed', 'dismissed')),
  created_at    timestamptz not null default now(),
  unique (post_id, reporter_id)
);

-- RLS
alter table post_complaints enable row level security;

-- Any authenticated user can file a complaint
create policy "users can insert own complaints"
  on post_complaints for insert
  with check (auth.uid() = reporter_id);

-- Users can read their own complaints
create policy "users can view own complaints"
  on post_complaints for select
  using (auth.uid() = reporter_id);

-- Admins can read all complaints
create policy "admins can view all complaints"
  on post_complaints for select
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Admins can update status
create policy "admins can update complaints"
  on post_complaints for update
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Admins can delete complaints
create policy "admins can delete complaints"
  on post_complaints for delete
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );
