-- =============================================
-- Friendships — run in Supabase SQL Editor
-- =============================================

create table if not exists public.friendships (
  id           uuid default gen_random_uuid() primary key,
  requester_id uuid references public.profiles(id) on delete cascade not null,
  addressee_id uuid references public.profiles(id) on delete cascade not null,
  status       text default 'pending' check (status in ('pending', 'accepted')),
  created_at   timestamptz default now(),
  updated_at   timestamptz default now(),
  unique(requester_id, addressee_id)
);

alter table public.friendships enable row level security;

create policy "Users can view their own friendships"
  on public.friendships for select
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

create policy "Users can send friend requests"
  on public.friendships for insert
  with check (auth.uid() = requester_id);

create policy "Addressee can accept"
  on public.friendships for update
  using (auth.uid() = addressee_id);

create policy "Either party can remove"
  on public.friendships for delete
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

grant select, insert, update, delete on public.friendships to authenticated;
