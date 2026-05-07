-- ============================================================
-- Post likes, comments, help requests
-- Run in Supabase SQL Editor
-- ============================================================

-- 1. Post likes
create table if not exists post_likes (
  id         uuid        primary key default gen_random_uuid(),
  post_id    uuid        not null references community_posts(id) on delete cascade,
  user_id    uuid        not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(post_id, user_id)
);
alter table post_likes enable row level security;
create policy "Anyone can view likes"       on post_likes for select to authenticated using (true);
create policy "Users can like posts"        on post_likes for insert to authenticated with check (user_id = auth.uid());
create policy "Users can unlike posts"      on post_likes for delete to authenticated using (user_id = auth.uid());

-- 2. Post comments
create table if not exists post_comments (
  id         uuid        primary key default gen_random_uuid(),
  post_id    uuid        not null references community_posts(id) on delete cascade,
  author_id  uuid        not null references profiles(id) on delete cascade,
  content    text        not null check (char_length(content) > 0),
  created_at timestamptz not null default now()
);
alter table post_comments enable row level security;
create policy "Anyone can view comments"    on post_comments for select to authenticated using (true);
create policy "Members can add comments"    on post_comments for insert to authenticated with check (author_id = auth.uid());
create policy "Authors can delete comments" on post_comments for delete to authenticated using (author_id = auth.uid());

-- 3. Help requests board
create table if not exists help_requests (
  id           uuid        primary key default gen_random_uuid(),
  author_id    uuid        not null references profiles(id) on delete cascade,
  type         text        not null check (type in ('need', 'offer')),
  category     text        not null,
  title        text        not null,
  description  text,
  city         text,
  region       text,
  contact_info text,
  is_active    boolean     not null default true,
  created_at   timestamptz not null default now()
);
alter table help_requests enable row level security;
create policy "Anyone can view help requests"  on help_requests for select to authenticated using (true);
create policy "Users can create help requests" on help_requests for insert to authenticated with check (author_id = auth.uid());
create policy "Authors can update requests"    on help_requests for update to authenticated using (author_id = auth.uid());
create policy "Authors can delete requests"    on help_requests for delete to authenticated using (author_id = auth.uid());
