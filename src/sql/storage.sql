-- Create storage bucket for creator avatars
insert into storage.buckets (id, name, public)
values ('creator-avatars', 'creator-avatars', true);

-- Set up storage policy to allow authenticated users to upload their own avatars
create policy "Users can upload their own avatar"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'creator-avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public access to read avatars
create policy "Anyone can view avatars"
on storage.objects for select
to public
using (bucket_id = 'creator-avatars');