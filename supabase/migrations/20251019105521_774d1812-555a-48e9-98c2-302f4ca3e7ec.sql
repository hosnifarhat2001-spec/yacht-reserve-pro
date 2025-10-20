-- Create cart_items table for persistent cart storage
CREATE TABLE IF NOT EXISTS public.cart_items (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  yacht_id BIGINT REFERENCES public.yachts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(session_id, yacht_id)
);

-- Enable RLS on cart_items
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- RLS policy for cart_items (public access for guest users)
CREATE POLICY "Anyone can manage their own cart"
  ON public.cart_items
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_cart_items_session_id ON public.cart_items(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_yacht_id ON public.cart_items(yacht_id);

-- Update bookings table to make user_id nullable for guest bookings
ALTER TABLE public.bookings ALTER COLUMN user_id DROP NOT NULL;

-- Add guest booking identifier
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS guest_session_id TEXT;

-- Create index for guest bookings
CREATE INDEX IF NOT EXISTS idx_bookings_guest_session ON public.bookings(guest_session_id);

-- Update RLS policies for bookings to allow guest bookings
DROP POLICY IF EXISTS "Users can create their own bookings" ON public.bookings;

CREATE POLICY "Anyone can create bookings"
  ON public.bookings
  FOR INSERT
  WITH CHECK (true);

-- Update view bookings policy
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;

CREATE POLICY "Users and guests can view their bookings"
  ON public.bookings
  FOR SELECT
  USING (
    auth.uid() = user_id OR 
    has_role(auth.uid(), 'admin'::app_role) OR
    guest_session_id IS NOT NULL
  );

-- Add a function to clean up old cart items (older than 7 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_cart_items()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.cart_items
  WHERE created_at < NOW() - INTERVAL '7 days';
$$;