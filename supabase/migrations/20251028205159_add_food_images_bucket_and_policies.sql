-- Create food-images storage bucket
insert into storage.buckets (id, name, public)
values ('food-images', 'food-images', true)
on conflict (id) do nothing;

-- Public can read files from this bucket
create policy if not exists "Food images are publicly accessible"
on storage.objects for select
using (bucket_id = 'food-images');

-- Only admins can upload food images
create policy if not exists "Admins can upload food images"
on storage.objects for insert
with check (
  bucket_id = 'food-images'
  and auth.uid() in (
    select user_id from public.user_roles where role = 'admin'
  )
);

-- Only admins can update food images (needed for upsert/overwrite)
create policy if not exists "Admins can update food images"
on storage.objects for update
using (
  bucket_id = 'food-images'
  and auth.uid() in (
    select user_id from public.user_roles where role = 'admin'
  )
);

-- Only admins can delete food images
create policy if not exists "Admins can delete food images"
on storage.objects for delete
using (
  bucket_id = 'food-images'
  and auth.uid() in (
    select user_id from public.user_roles where role = 'admin'
  )
);
