-- Drop the existing restrictive policy for creating bookings
DROP POLICY IF EXISTS "Users can create bookings" ON public.bookings;

-- Create new policy that allows both authenticated users and guest bookings
CREATE POLICY "Users and guests can create bookings"
ON public.bookings
FOR INSERT
WITH CHECK (
  -- Allow authenticated users to create bookings with their own user_id
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  OR
  -- Allow guest bookings (when not authenticated) with a placeholder user_id
  (auth.uid() IS NULL AND user_id = '00000000-0000-0000-0000-000000000000'::uuid)
);