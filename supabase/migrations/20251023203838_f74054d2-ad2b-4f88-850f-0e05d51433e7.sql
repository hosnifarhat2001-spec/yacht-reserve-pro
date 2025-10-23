-- Create yacht-images storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('yacht-images', 'yacht-images', true);

-- Create storage policies for yacht images
CREATE POLICY "Yacht images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'yacht-images');

CREATE POLICY "Admins can upload yacht images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'yacht-images' 
  AND auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  )
);

CREATE POLICY "Admins can update yacht images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'yacht-images'
  AND auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  )
);

CREATE POLICY "Admins can delete yacht images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'yacht-images'
  AND auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  )
);