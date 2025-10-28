-- Create water sports activities table
CREATE TABLE public.water_sports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  pax INTEGER NOT NULL,
  price_30min NUMERIC NOT NULL,
  price_60min NUMERIC NOT NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Create food items table
CREATE TABLE public.food_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price_per_person NUMERIC NOT NULL,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Create cart items table for water sports and food
CREATE TABLE public.service_cart_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('water_sport', 'food')),
  item_id UUID NOT NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  duration INTEGER, -- For water sports: 30 or 60 minutes
  price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.water_sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_cart_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for water_sports
CREATE POLICY "Water sports are viewable by everyone"
  ON public.water_sports FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage water sports"
  ON public.water_sports FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for food_items
CREATE POLICY "Food items are viewable by everyone"
  ON public.food_items FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage food items"
  ON public.food_items FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for service_cart_items
CREATE POLICY "Users can view own cart items"
  ON public.service_cart_items FOR SELECT
  USING (true);

CREATE POLICY "Users can insert cart items"
  ON public.service_cart_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own cart items"
  ON public.service_cart_items FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete own cart items"
  ON public.service_cart_items FOR DELETE
  USING (true);

CREATE POLICY "Admins can manage all cart items"
  ON public.service_cart_items FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create triggers for updated_at
CREATE TRIGGER update_water_sports_updated_at
  BEFORE UPDATE ON public.water_sports
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_food_items_updated_at
  BEFORE UPDATE ON public.food_items
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Insert sample data for water sports
INSERT INTO public.water_sports (name, pax, price_30min, price_60min, display_order) VALUES
  ('Banana Boat', 5, 600, 800, 1),
  ('Jet Ski', 2, 700, 1000, 2);

-- Insert sample data for food items
INSERT INTO public.food_items (name, price_per_person, description, display_order) VALUES
  ('Seafood Menu', 120, 'Fresh seafood selection', 1),
  ('Grilled Chicken Menu', 90, 'Perfectly grilled chicken', 2),
  ('Vegan Menu', 80, 'Delicious plant-based options', 3);