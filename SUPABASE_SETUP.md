# 🚀 Complete Supabase Setup Guide

## ✅ Step 1 Complete: Credentials Added

Your Supabase credentials are in `.env`. Now let's create your complete database!

---

## 📋 Step 2: Create Complete Database Schema

1. Open Supabase Dashboard: https://eoznloexwuixpcoqsytt.supabase.co
2. Go to **SQL Editor** (left sidebar)
3. Open the file `supabase-migrations.sql` in your project
4. Copy **ALL** contents (it's a long file!)
5. Paste into SQL Editor
6. Click **Run** button

### What This Creates:

**11 Database Tables:**
- ✅ User profiles & authentication
- ✅ Admin role management
- ✅ Yachts catalog
- ✅ Booking system
- ✅ Site settings (dynamic content)
- ✅ Service features
- ✅ Customer testimonials
- ✅ Contact messages
- ✅ FAQs
- ✅ Statistics views

**2 Storage Buckets:**
- ✅ yacht-images (for yacht photos)
- ✅ avatars (for user profiles)

**Sample Data:**
- ✅ 4 sample yachts
- ✅ 6 service features
- ✅ 3 testimonials
- ✅ 4 FAQs
- ✅ Site configuration

**Result:** You should see success messages and a notice about creating your admin user.

---

## 👤 Step 3: Create Your Admin Account

### Option A: Sign up through the app
1. Go to your app's homepage
2. Try to book a yacht (you'll be prompted to login)
3. Create an account with your email and password

### Option B: Create directly in Supabase
1. In Supabase Dashboard, go to **Authentication** → **Users**
2. Click **Add User**
3. Enter email and password
4. Click **Create User**

---

## 🔑 Step 4: Grant Admin Access

1. In Supabase Dashboard, go to **Authentication** → **Users**
2. Click on your user to see their UUID (looks like: `123e4567-e89b-12d3-a456-426614174000`)
3. Copy the UUID
4. Go to **SQL Editor**
5. Run this SQL (replace `your-user-id` with your actual UUID):

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('your-user-id', 'admin');
```

✅ Now you have admin access!

---

## 🧪 Step 5: Test Everything

### Test Public Site:
1. Visit your homepage - should see yachts list
2. Click "Book Now" on any yacht
3. Complete a booking

### Test Admin Dashboard:
1. Go to `/admin`
2. Login with your credentials
3. You should see the admin dashboard with:
   - Stats (total yachts, bookings, revenue)
   - Yacht management (add/edit/delete yachts)
   - Booking management (view/delete bookings)

---

## 🎨 Step 6: Add Sample Yachts (Optional)

The migration includes 3 sample yachts. If you want to add more:

1. Login to admin dashboard
2. Click "Add New Yacht"
3. Fill in the form:
   - Name (English & Arabic)
   - Description (English & Arabic)
   - Image URL (use Unsplash or upload to Supabase Storage)
   - Capacity, Length, Price

---

## 📁 Supabase Storage Setup (For Yacht Images)

If you want to upload images instead of using URLs:

1. Go to **Storage** in Supabase Dashboard
2. The `yacht-images` bucket is already created
3. Upload images there
4. Get the public URL and use it in the yacht form

---

## 🔐 Security Notes

- ✅ Row Level Security (RLS) is enabled on all tables
- ✅ Admin role is stored separately (not in profiles)
- ✅ Server-side role checking prevents privilege escalation
- ✅ All bookings are linked to authenticated users

---

## 🐛 Troubleshooting

### Can't see yachts on homepage?
- Check if sample data was inserted in migration
- Check browser console for errors
- Verify RLS policies are active

### Can't login to admin?
- Make sure you ran the admin role SQL
- Check that user exists in Authentication
- Verify the UUID is correct

### Booking not working?
- Make sure you're logged in
- Check console for error messages
- Verify `bookings` table exists

### Need help?
Check the browser console (F12) for detailed error messages.

---

## 🎉 Congratulations! Your Database is Complete!

### What You Have Now:

**📊 11 Database Tables** - Everything from yachts to testimonials  
**🔐 Secure Authentication** - User roles, profiles, and permissions  
**📝 Dynamic Content** - Manage everything from admin panel  
**💾 File Storage** - Upload yacht images and avatars  
**📈 Analytics** - Built-in statistics and reporting  
**🌍 Bilingual** - Full Arabic and English support  

### Next Steps:

1. **Login to admin dashboard** at `/admin`
2. **Add more yachts** from the admin panel
3. **Customize site settings** (contact info, titles, etc.)
4. **Add testimonials** to build trust
5. **Manage bookings** as they come in

### Need Help?

Check `DATABASE_STRUCTURE.md` for complete schema documentation.

Happy sailing! ⛵
