-- ============================================================
-- Create friendships table + RLS policies
-- Run in Supabase SQL Editor
-- ============================================================

create table if not exists friendships (
  id           uuid        primary key default gen_random_uuid(),
  requester_id uuid        not null references profiles(id) on delete cascade,
  addressee_id uuid        not null references profiles(id) on delete cascade,
  status       text        not null default 'pending' check (status in ('pending', 'accepted')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (requester_id, addressee_id)
);

alter table friendships enable row level security;

-- View: both parties can see the friendship row
create policy "Users can view their own friendships"
  on friendships for select
  to authenticated
  using (requester_id = auth.uid() or addressee_id = auth.uid());

-- Insert: only the requester can create
create policy "Users can send friend requests"
  on friendships for insert
  to authenticated
  with check (requester_id = auth.uid());

-- Update: only the addressee can accept/reject
create policy "Users can update received requests"
  on friendships for update
  to authenticated
  using (addressee_id = auth.uid());

-- Delete: either party can remove
create policy "Users can delete their friendships"
  on friendships for delete
  to authenticated
  using (requester_id = auth.uid() or addressee_id = auth.uid());

-- Ensure profiles are readable by all authenticated users (needed for search)
drop policy if exists "Profiles are viewable by authenticated users" on profiles;
create policy "Profiles are viewable by authenticated users"
  on profiles for select
  to authenticated
  using (true);
