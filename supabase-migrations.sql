-- =============================================
-- YACHT RENTAL PLATFORM - COMPLETE SUPABASE SCHEMA
-- =============================================
-- Run this in your Supabase SQL Editor
-- =============================================

-- 1. Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- 2. Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 3. Create user_roles table (CRITICAL: separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view roles"
  ON public.user_roles FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- 4. Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 5. Create yachts table
CREATE TABLE public.yachts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description_en TEXT,
  description_ar TEXT,
  image_url TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  length DECIMAL(10,2) NOT NULL,
  price_per_day DECIMAL(10,2) NOT NULL,
  featured BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.yachts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active yachts"
  ON public.yachts FOR SELECT
  USING (active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert yachts"
  ON public.yachts FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update yachts"
  ON public.yachts FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete yachts"
  ON public.yachts FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- 6. Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  yacht_id UUID REFERENCES public.yachts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all bookings"
  ON public.bookings FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update bookings"
  ON public.bookings FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete bookings"
  ON public.bookings FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- 7. Create site_settings table (for dynamic content)
CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value_en TEXT,
  value_ar TEXT,
  type TEXT DEFAULT 'text',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view site settings"
  ON public.site_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage site settings"
  ON public.site_settings FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- 8. Create features table (yacht/service features)
CREATE TABLE public.features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description_en TEXT,
  description_ar TEXT,
  icon TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active features"
  ON public.features FOR SELECT
  USING (active = true);

CREATE POLICY "Admins can manage features"
  ON public.features FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- 9. Create testimonials/reviews table
CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_title TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_en TEXT NOT NULL,
  review_ar TEXT NOT NULL,
  avatar_url TEXT,
  yacht_id UUID REFERENCES public.yachts(id) ON DELETE SET NULL,
  featured BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active testimonials"
  ON public.testimonials FOR SELECT
  USING (active = true);

CREATE POLICY "Admins can manage testimonials"
  ON public.testimonials FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- 10. Create contact_messages table
CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread',
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages"
  ON public.contact_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all messages"
  ON public.contact_messages FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can create contact messages"
  ON public.contact_messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can update messages"
  ON public.contact_messages FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- 11. Create faqs table
CREATE TABLE public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_en TEXT NOT NULL,
  question_ar TEXT NOT NULL,
  answer_en TEXT NOT NULL,
  answer_ar TEXT NOT NULL,
  category TEXT,
  order_index INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active FAQs"
  ON public.faqs FOR SELECT
  USING (active = true);

CREATE POLICY "Admins can manage FAQs"
  ON public.faqs FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- 12. Create storage bucket for yacht images
INSERT INTO storage.buckets (id, name, public)
VALUES ('yacht-images', 'yacht-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view yacht images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'yacht-images');

CREATE POLICY "Admins can upload yacht images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'yacht-images' AND
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can update yacht images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'yacht-images' AND
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can delete yacht images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'yacht-images' AND
    public.has_role(auth.uid(), 'admin')
  );

-- 13. Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- 14. Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone'
  );
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- 15. Create trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 16. Function to get booked dates for a yacht
CREATE OR REPLACE FUNCTION public.get_booked_dates(yacht_uuid UUID)
RETURNS TABLE (booked_date DATE)
LANGUAGE SQL
STABLE
AS $$
  SELECT DISTINCT generate_series(start_date, end_date, '1 day'::interval)::DATE
  FROM public.bookings
  WHERE yacht_id = yacht_uuid
    AND status NOT IN ('cancelled', 'rejected');
$$;

-- 17. Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 18. Add update triggers
CREATE TRIGGER update_yachts_updated_at
  BEFORE UPDATE ON public.yachts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- =============================================
-- INITIAL DATA SETUP
-- =============================================

-- Insert default site settings
INSERT INTO public.site_settings (key, value_en, value_ar, type) VALUES
  ('site_title', 'Luxury Yacht Rentals', 'تأجير اليخوت الفاخرة', 'text'),
  ('site_tagline', 'Experience the ultimate luxury with our premium yacht fleet', 'استمتع بتجربة بحرية استثنائية على يخوتنا الفاخرة', 'text'),
  ('contact_email', 'info@luxuryyachts.com', 'info@luxuryyachts.com', 'text'),
  ('contact_phone', '+966 50 123 4567', '+966 50 123 4567', 'text'),
  ('contact_address', 'Jeddah, Saudi Arabia', 'جدة، المملكة العربية السعودية', 'text'),
  ('hero_title', 'Luxury Yacht Rentals', 'تأجير اليخوت الفاخرة', 'text'),
  ('hero_subtitle', 'Experience the ultimate luxury with our premium yacht fleet', 'استمتع بتجربة بحرية استثنائية على يخوتنا الفاخرة', 'text'),
  ('about_text', 'We offer the finest selection of luxury yachts for your perfect sea adventure', 'نقدم أفضل مجموعة من اليخوت الفاخرة لمغامرتك البحرية المثالية', 'text');

-- Insert sample features
INSERT INTO public.features (name_en, name_ar, description_en, description_ar, icon) VALUES
  ('Professional Crew', 'طاقم محترف', 'Experienced and certified crew members', 'أفراد طاقم ذوي خبرة ومعتمدين', '👨‍✈️'),
  ('Luxury Amenities', 'مرافق فاخرة', 'Premium facilities and equipment', 'مرافق ومعدات فاخرة', '⭐'),
  ('Gourmet Catering', 'تقديم طعام فاخر', 'Delicious meals prepared by expert chefs', 'وجبات لذيذة يحضرها طهاة خبراء', '🍽️'),
  ('Water Sports', 'رياضات مائية', 'Jet skis, diving equipment, and more', 'دراجات مائية ومعدات غوص والمزيد', '🏄'),
  ('Full Insurance', 'تأمين شامل', 'Comprehensive coverage for your peace of mind', 'تغطية شاملة لراحة بالك', '🛡️'),
  ('24/7 Support', 'دعم على مدار الساعة', 'Around the clock customer service', 'خدمة عملاء على مدار الساعة', '📞');

-- Insert sample yachts
INSERT INTO public.yachts (name_en, name_ar, description_en, description_ar, image_url, capacity, length, price_per_day, featured) VALUES
  ('Ocean Dream', 'حلم المحيط', 'Luxury yacht perfect for family trips with spacious deck and modern amenities', 'يخت فاخر مثالي للرحلات العائلية مع سطح واسع ومرافق عصرية', 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800', 12, 25.5, 1500, true),
  ('Sea Breeze', 'نسيم البحر', 'Modern yacht with all amenities including jacuzzi and entertainment system', 'يخت عصري بجميع المرافق بما في ذلك جاكوزي ونظام ترفيه', 'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=800', 8, 20.0, 1200, true),
  ('Azure Pearl', 'لؤلؤة الأزرق', 'Elegant yacht for special occasions with premium dining area', 'يخت أنيق للمناسبات الخاصة مع منطقة طعام فاخرة', 'https://images.unsplash.com/photo-1606318313053-78ed3c1c0f75?w=800', 15, 30.0, 2000, true),
  ('Royal Wave', 'الموجة الملكية', 'Premium yacht with master suite and panoramic views', 'يخت فاخر مع جناح رئيسي وإطلالات بانورامية', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800', 10, 28.0, 1800, false);

-- Insert sample testimonials
INSERT INTO public.testimonials (customer_name, customer_title, rating, review_en, review_ar, featured) VALUES
  ('Ahmed Al-Rashid', 'Business Owner', 5, 'Absolutely amazing experience! The yacht was pristine and the crew was professional.', 'تجربة رائعة حقًا! كان اليخت نظيفًا والطاقم محترفًا.', true),
  ('Sarah Johnson', 'Event Planner', 5, 'Perfect for our corporate event. Everything was well organized.', 'مثالي لحدثنا التجاري. كان كل شيء منظمًا بشكل جيد.', true),
  ('Mohammed Hassan', 'Tourist', 4, 'Great service and beautiful yacht. Highly recommended!', 'خدمة رائعة ويخت جميل. أوصي به بشدة!', true);

-- Insert sample FAQs
INSERT INTO public.faqs (question_en, question_ar, answer_en, answer_ar, category, order_index) VALUES
  ('How do I book a yacht?', 'كيف أحجز يخت؟', 'Simply select your preferred yacht, choose your dates, and complete the booking form. Our team will confirm your reservation.', 'ببساطة اختر اليخت المفضل لديك، اختر التواريخ، وأكمل نموذج الحجز. سيؤكد فريقنا حجزك.', 'booking', 1),
  ('What is included in the price?', 'ما هو المشمول في السعر؟', 'The price includes yacht rental, professional crew, fuel, and basic amenities. Catering and special services can be added.', 'يشمل السعر تأجير اليخت، طاقم محترف، وقود، ومرافق أساسية. يمكن إضافة خدمة الطعام والخدمات الخاصة.', 'pricing', 2),
  ('Can I cancel my booking?', 'هل يمكنني إلغاء حجزي؟', 'Yes, cancellations are allowed up to 48 hours before departure with a full refund.', 'نعم، يُسمح بالإلغاء قبل 48 ساعة من المغادرة مع استرداد كامل المبلغ.', 'booking', 3),
  ('Do you provide catering?', 'هل تقدمون خدمة الطعام؟', 'Yes, we offer various catering packages. Please specify your preferences when booking.', 'نعم، نقدم باقات طعام متنوعة. يرجى تحديد تفضيلاتك عند الحجز.', 'services', 4);

-- =============================================
-- ADMIN USER SETUP (Run this separately)
-- =============================================
-- After creating your first user, run this to grant admin access:
-- Replace 'your-user-id' with your actual UUID from auth.users

-- INSERT INTO public.user_roles (user_id, role)
-- VALUES ('your-user-id', 'admin');

-- =============================================
-- VIEWS FOR ADMIN DASHBOARD
-- =============================================

-- Create view for booking statistics
CREATE OR REPLACE VIEW public.booking_stats AS
SELECT
  COUNT(*) as total_bookings,
  COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_bookings,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_bookings,
  SUM(total_price) as total_revenue,
  SUM(total_price) FILTER (WHERE status = 'confirmed') as confirmed_revenue
FROM public.bookings;

-- Create view for yacht statistics
CREATE OR REPLACE VIEW public.yacht_stats AS
SELECT
  y.id,
  y.name_en,
  y.name_ar,
  COUNT(b.id) as total_bookings,
  SUM(b.total_price) as total_revenue,
  AVG(b.total_price) as avg_booking_value
FROM public.yachts y
LEFT JOIN public.bookings b ON y.id = b.yacht_id
WHERE y.active = true
GROUP BY y.id, y.name_en, y.name_ar;

-- Grant access to views
GRANT SELECT ON public.booking_stats TO authenticated;
GRANT SELECT ON public.yacht_stats TO authenticated;

-- =============================================
-- COMPLETION MESSAGE
-- =============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Database schema created successfully!';
  RAISE NOTICE '📊 Tables created: profiles, user_roles, yachts, bookings, site_settings, features, testimonials, contact_messages, faqs';
  RAISE NOTICE '🗂️ Storage buckets: yacht-images, avatars';
  RAISE NOTICE '🔐 RLS policies enabled on all tables';
  RAISE NOTICE '📝 Sample data inserted';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️ IMPORTANT: Create your admin user and run:';
  RAISE NOTICE 'INSERT INTO public.user_roles (user_id, role) VALUES (''your-user-id'', ''admin'');';
END $$;
