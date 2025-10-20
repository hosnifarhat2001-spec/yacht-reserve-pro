-- Create yacht_options table for additional services/add-ons
CREATE TABLE public.yacht_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  yacht_id UUID NOT NULL REFERENCES public.yachts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_ar TEXT,
  price NUMERIC NOT NULL,
  description TEXT,
  description_ar TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.yacht_options ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Yacht options are viewable by everyone"
  ON public.yacht_options
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage yacht options"
  ON public.yacht_options
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_yacht_options_updated_at
  BEFORE UPDATE ON public.yacht_options
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create booking_options table to track selected options
CREATE TABLE public.booking_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES public.yacht_options(id) ON DELETE CASCADE,
  option_name TEXT NOT NULL,
  option_price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.booking_options ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Booking options viewable by booking owner or admin"
  ON public.booking_options
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE bookings.id = booking_options.booking_id
      AND (bookings.user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
    )
  );

CREATE POLICY "Users can insert booking options with their bookings"
  ON public.booking_options
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE bookings.id = booking_options.booking_id
      AND bookings.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all booking options"
  ON public.booking_options
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));