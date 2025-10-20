-- Add customer information columns to bookings table
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS customer_name TEXT,
ADD COLUMN IF NOT EXISTS customer_email TEXT,
ADD COLUMN IF NOT EXISTS customer_phone TEXT;

-- Create profiles table for client management
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage profiles"
  ON public.profiles FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create promotions table
CREATE TABLE IF NOT EXISTS public.promotions (
  id BIGSERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_percentage NUMERIC(5,2) CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  yacht_id BIGINT REFERENCES public.yachts(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CHECK (end_date >= start_date)
);

-- Enable RLS on promotions
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- RLS policies for promotions
CREATE POLICY "Anyone can view active promotions"
  ON public.promotions FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage promotions"
  ON public.promotions FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Update bookings RLS to allow admins to update status
CREATE POLICY "Admins can update booking status"
  ON public.bookings FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_promotions_yacht_id ON public.promotions(yacht_id);
CREATE INDEX IF NOT EXISTS idx_promotions_active ON public.promotions(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_email ON public.bookings(customer_email);