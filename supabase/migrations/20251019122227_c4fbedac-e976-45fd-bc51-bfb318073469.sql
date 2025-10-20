-- Add yacht_id to promotions table to link promotions to specific yachts
ALTER TABLE public.promotions ADD COLUMN yacht_id uuid REFERENCES public.yachts(id) ON DELETE CASCADE;

-- Add index for better performance
CREATE INDEX idx_promotions_yacht_id ON public.promotions(yacht_id);

-- Update RLS policy for profiles to allow admin deletion
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
CREATE POLICY "Admins can delete profiles"
ON public.profiles
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));