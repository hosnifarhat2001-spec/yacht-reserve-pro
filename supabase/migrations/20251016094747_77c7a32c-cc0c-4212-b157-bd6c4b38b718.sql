-- Create function to get booked dates for a yacht
CREATE OR REPLACE FUNCTION public.get_booked_dates(yacht_uuid bigint)
RETURNS TABLE (
  start_date date,
  end_date date
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT start_date, end_date
  FROM public.bookings
  WHERE yacht_id = yacht_uuid
    AND status != 'cancelled'
  ORDER BY start_date;
$$;

-- Add index on bookings for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_yacht_id ON public.bookings(yacht_id);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON public.bookings(start_date, end_date);

-- Create view for yacht availability
CREATE OR REPLACE VIEW public.v_yacht_availability AS
SELECT 
  y.id as yacht_id,
  y.name as yacht_name,
  y.is_available,
  COUNT(b.id) as total_bookings,
  COALESCE(SUM(b.total_price), 0) as total_revenue
FROM public.yachts y
LEFT JOIN public.bookings b ON y.id = b.yacht_id AND b.status = 'confirmed'
GROUP BY y.id, y.name, y.is_available;