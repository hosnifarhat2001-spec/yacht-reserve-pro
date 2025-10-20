-- Add length column to yachts table
ALTER TABLE public.yachts 
ADD COLUMN IF NOT EXISTS length NUMERIC;