-- =============================================
-- SECURITY FIX: Restrict cart_items access to admins only
-- =============================================
-- The cart_items table is only used by admins to view session data
-- Users use client-side cart storage (zustand)

-- Drop overly permissive public policies
DROP POLICY IF EXISTS "Anyone can view cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Anyone can insert cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Anyone can delete cart items" ON public.cart_items;

-- Create admin-only policies
CREATE POLICY "Admins can view all cart items"
  ON public.cart_items FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete cart items"
  ON public.cart_items FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert cart items"
  ON public.cart_items FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update cart items"
  ON public.cart_items FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));