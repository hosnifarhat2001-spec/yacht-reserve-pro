-- Add additional fields to bookings table for comprehensive booking management
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS trip_start_time TIME,
ADD COLUMN IF NOT EXISTS trip_end_time TIME,
ADD COLUMN IF NOT EXISTS number_of_persons INTEGER,
ADD COLUMN IF NOT EXISTS trip_type TEXT,
ADD COLUMN IF NOT EXISTS rate_per_hour NUMERIC,
ADD COLUMN IF NOT EXISTS apply_vat BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS other_charges NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS coupon_code TEXT,
ADD COLUMN IF NOT EXISTS supplier_yacht_payable NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS supplier_extra_payable NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS fine_penalty NUMERIC DEFAULT 0;

-- Add comment to describe the enhanced booking structure
COMMENT ON TABLE public.bookings IS 'Enhanced bookings table with comprehensive trip and payment information';