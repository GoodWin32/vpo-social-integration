-- =============================================
-- Supabase Storage — run in SQL Editor
-- Creates buckets and RLS policies for file uploads
-- =============================================

-- Create buckets
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 5242880, array['image/jpeg','image/png','image/webp','image/gif']),
  ('images',  'images',  true, 10485760, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do nothing;

-- =============================================
-- AVATARS bucket policies
-- =============================================
create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Authenticated users can upload avatars"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatars');

create policy "Users can update their own avatar"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete their own avatar"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

-- =============================================
-- IMAGES bucket policies (community/event covers)
-- =============================================
create policy "Community/event images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'images');

create policy "Authenticated users can upload images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'images');

create policy "Users can update their own images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'images' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete their own images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'images' and auth.uid()::text = (storage.foldername(name))[1]);
