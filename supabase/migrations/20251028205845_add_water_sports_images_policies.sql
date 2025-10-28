-- Ensure water-sports-images bucket exists (public read bucket)
insert into storage.buckets (id, name, public)
values ('water-sports-images', 'water-sports-images', true)
on conflict (id) do nothing;

-- Public can read files from this bucket
create policy if not exists "Water sports images are publicly accessible"
on storage.objects for select
using (bucket_id = 'water-sports-images');

-- Only admins can upload water sports images
create policy if not exists "Admins can upload water sports images"
on storage.objects for insert
with check (
  bucket_id = 'water-sports-images'
  and auth.uid() in (
    select user_id from public.user_roles where role = 'admin'
  )
);

-- Only admins can update images
create policy if not exists "Admins can update water sports images"
on storage.objects for update
using (
  bucket_id = 'water-sports-images'
  and auth.uid() in (
    select user_id from public.user_roles where role = 'admin'
  )
);

-- Only admins can delete images
create policy if not exists "Admins can delete water sports images"
on storage.objects for delete
using (
  bucket_id = 'water-sports-images'
  and auth.uid() in (
    select user_id from public.user_roles where role = 'admin'
  )
);
