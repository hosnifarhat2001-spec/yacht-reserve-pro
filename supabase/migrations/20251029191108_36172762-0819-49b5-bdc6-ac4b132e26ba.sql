-- Create additional_services table
CREATE TABLE public.additional_services (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  price numeric NOT NULL,
  image_url text,
  description text,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.additional_services ENABLE ROW LEVEL SECURITY;

-- RLS Policies for additional_services
CREATE POLICY "Additional services are viewable by everyone"
ON public.additional_services
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage additional services"
ON public.additional_services
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can insert additional services"
ON public.additional_services
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Create storage bucket for additional services images
INSERT INTO storage.buckets (id, name, public)
VALUES ('additional-services-images', 'additional-services-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for additional-services-images bucket
CREATE POLICY "Anyone can view additional services images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'additional-services-images');

CREATE POLICY "Authenticated users can upload additional services images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'additional-services-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Admins can update additional services images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'additional-services-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete additional services images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'additional-services-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Add trigger for updated_at
CREATE TRIGGER update_additional_services_updated_at
BEFORE UPDATE ON public.additional_services
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Insert sample data
INSERT INTO public.additional_services (name, price, description, display_order) VALUES
('Birthday Decoration', 600, 'Beautiful birthday decorations for your special day', 1),
('Private Photographer', 400, 'Professional photographer for your yacht experience', 2),
('Romantic Dinner Setup', 700, 'Elegant romantic dinner setup with candles and flowers', 3);