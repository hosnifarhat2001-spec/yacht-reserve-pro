-- Create sports-images storage bucket
insert into storage.buckets (id, name, public)
values ('sports-images', 'sports-images', true)
on conflict (id) do nothing;

-- Public can read files from this bucket
create policy if not exists "Sports images are publicly accessible"
on storage.objects for select
using (bucket_id = 'sports-images');

-- Only admins can upload sports images
create policy if not exists "Admins can upload sports images"
on storage.objects for insert
with check (
  bucket_id = 'sports-images'
  and auth.uid() in (
    select user_id from public.user_roles where role = 'admin'
  )
);

-- Only admins can update sports images
create policy if not exists "Admins can update sports images"
on storage.objects for update
using (
  bucket_id = 'sports-images'
  and auth.uid() in (
    select user_id from public.user_roles where role = 'admin'
  )
);

-- Only admins can delete sports images
create policy if not exists "Admins can delete sports images"
on storage.objects for delete
using (
  bucket_id = 'sports-images'
  and auth.uid() in (
    select user_id from public.user_roles where role = 'admin'
  )
);
