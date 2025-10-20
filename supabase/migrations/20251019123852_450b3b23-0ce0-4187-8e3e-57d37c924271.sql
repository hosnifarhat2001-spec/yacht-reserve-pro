-- Add new columns to bookings table for enhanced booking functionality
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_source text DEFAULT 'direct' CHECK (booking_source IN ('direct', 'whatsapp'));
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS duration_type text DEFAULT 'daily' CHECK (duration_type IN ('hourly', 'daily'));
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS duration_value numeric;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_bookings_yacht_dates ON bookings(yacht_id, start_date, end_date);

-- Add comment for documentation
COMMENT ON COLUMN bookings.booking_source IS 'Source of the booking: direct (via website) or whatsapp (via WhatsApp link)';
COMMENT ON COLUMN bookings.duration_type IS 'Type of rental duration: hourly or daily';
COMMENT ON COLUMN bookings.duration_value IS 'Duration value in hours or days depending on duration_type';