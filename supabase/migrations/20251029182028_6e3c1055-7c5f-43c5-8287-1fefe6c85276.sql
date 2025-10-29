-- Storage policies for food-images bucket
CREATE POLICY "Anyone can view food images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'food-images');

CREATE POLICY "Authenticated users can upload food images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'food-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Admins can update food images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'food-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete food images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'food-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Storage policies for water-sports-images bucket
CREATE POLICY "Anyone can view water sports images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'water-sports-images');

CREATE POLICY "Authenticated users can upload water sports images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'water-sports-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Admins can update water sports images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'water-sports-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete water sports images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'water-sports-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);