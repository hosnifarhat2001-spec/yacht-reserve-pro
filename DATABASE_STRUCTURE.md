# 📊 Complete Database Structure

## All Tables Created in Supabase

### 🔐 Authentication & Users

#### `profiles`
- User profile information
- Columns: id, full_name, phone, avatar_url, created_at, updated_at
- Users can view/update their own profile

#### `user_roles`
- User role management (admin/user)
- Columns: id, user_id, role, created_at
- **CRITICAL**: Admins assigned here, separate from profiles for security

### ⛵ Yacht Management

#### `yachts`
- All yacht listings
- Columns: id, name_en, name_ar, description_en, description_ar, image_url, capacity, length, price_per_day, featured, active, created_at, updated_at
- Public can view active yachts
- Admins can manage all yachts

### 📅 Bookings

#### `bookings`
- Customer yacht reservations
- Columns: id, yacht_id, user_id, customer_name, customer_email, customer_phone, start_date, end_date, total_price, status, payment_status, notes, created_at, updated_at
- Users see their own bookings
- Admins see all bookings

### 🎨 Dynamic Content

#### `site_settings`
- Website configuration (titles, taglines, contact info)
- Columns: id, key, value_en, value_ar, type, updated_at
- Public can view
- Admins can modify

#### `features`
- Service features (crew, amenities, etc.)
- Columns: id, name_en, name_ar, description_en, description_ar, icon, active, created_at
- Displayed on homepage

#### `testimonials`
- Customer reviews and ratings
- Columns: id, customer_name, customer_title, rating, review_en, review_ar, avatar_url, yacht_id, featured, active, created_at
- Featured testimonials shown on homepage

#### `faqs`
- Frequently asked questions
- Columns: id, question_en, question_ar, answer_en, answer_ar, category, order_index, active, created_at
- Organized by category and order

#### `contact_messages`
- Contact form submissions
- Columns: id, name, email, phone, subject, message, status, user_id, created_at
- Anyone can submit
- Admins can view/manage

### 📁 Storage Buckets

#### `yacht-images`
- Upload yacht photos
- Public viewing, admin upload

#### `avatars`
- User profile pictures
- Users can upload their own

### 📈 Views (for reporting)

#### `booking_stats`
- Total bookings, revenue, confirmed vs pending

#### `yacht_stats`
- Per-yacht bookings and revenue statistics

## 🔒 Security Features

✅ **Row Level Security (RLS)** enabled on all tables  
✅ **Admin roles** stored separately to prevent privilege escalation  
✅ **User isolation** - users only see their own data  
✅ **Secure functions** - server-side role checking  
✅ **Storage policies** - controlled file access  

## 📝 Sample Data Included

- ✅ 4 sample yachts
- ✅ 6 service features
- ✅ 3 customer testimonials
- ✅ 4 FAQs
- ✅ 8 site settings (titles, contact info, etc.)

## 🚀 Ready to Use

All tables are ready with:
- Proper relationships and foreign keys
- Automatic timestamp updates
- Cascading deletes where appropriate
- Bilingual support (English & Arabic)
