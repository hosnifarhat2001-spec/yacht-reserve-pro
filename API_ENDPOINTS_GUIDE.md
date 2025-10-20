# Yacht Rental Platform - Complete API Guide

## Overview

This document provides all API endpoints and data structures for the Yacht Rental Platform. All endpoints use the Supabase client library for type-safe database operations.

---

## 📦 Setup

```typescript
import { supabase } from '@/integrations/supabase/client';
```

---

## 🏠 Public Endpoints (No Authentication Required)

### 1. Get All Yachts

**Purpose:** Fetch all available yachts for display on home page

```typescript
const { data, error } = await supabase
  .from('yachts')
  .select('*')
  .order('created_at', { ascending: false });

// Response Data Structure
interface Yacht {
  id: string;
  name: string;
  description: string;
  main_image: string;
  capacity: number;
  price_per_day: number;
  price_per_hour?: number;
  location?: string;
  features?: string[];
  is_available: boolean;
  created_at: string;
  updated_at: string;
}
```

**Real-time Subscription:**
```typescript
const yachtsChannel = supabase
  .channel('yachts-changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'yachts' },
    (payload) => {
      console.log('Yacht updated:', payload);
      // Reload yachts data
    }
  )
  .subscribe();
```

---

### 2. Get Active Promotions

**Purpose:** Fetch all active promotions and discounts

```typescript
const { data, error } = await supabase
  .from('promotions')
  .select('*')
  .eq('is_active', true)
  .gte('valid_until', new Date().toISOString())
  .order('created_at', { ascending: false });

// Response Data Structure
interface Promotion {
  id: string;
  title: string;
  code?: string;
  description: string;
  discount_percentage?: number;
  discount_amount?: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

---

### 3. Create Booking (Guest or Authenticated)

**Purpose:** Book a yacht (works for both guests and logged-in users)

```typescript
const { data, error } = await supabase
  .from('bookings')
  .insert({
    yacht_id: yachtId,
    user_id: userId || null, // null for guest bookings
    customer_name: name,
    customer_email: email,
    customer_phone: phone,
    start_date: startDate,
    end_date: endDate,
    total_price: totalPrice,
    notes: notes,
    status: 'pending'
  })
  .select()
  .single();

// Response Data Structure
interface Booking {
  id: string;
  yacht_id: string;
  user_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
}
```

---

### 4. Get Booked Dates for Yacht

**Purpose:** Check availability before booking

```typescript
const { data, error } = await supabase
  .from('bookings')
  .select('start_date, end_date')
  .eq('yacht_id', yachtId)
  .in('status', ['pending', 'confirmed']);

// Returns array of date ranges
// Filter out cancelled/rejected bookings
```

---

### 5. Cart Operations

#### Add to Cart
```typescript
const { data, error } = await supabase
  .from('cart_items')
  .insert({
    session_id: sessionId, // Generate unique session ID
    yacht_id: yachtId,
    start_date: startDate,
    end_date: endDate,
    price: calculatedPrice
  });
```

#### Get Cart Items
```typescript
const { data, error } = await supabase
  .from('cart_items')
  .select(`
    *,
    yacht:yachts (
      name,
      main_image,
      capacity,
      location,
      features,
      price_per_day,
      price_per_hour
    )
  `)
  .eq('session_id', sessionId);
```

#### Remove from Cart
```typescript
const { error } = await supabase
  .from('cart_items')
  .delete()
  .eq('id', cartItemId);
```

#### Clear Cart
```typescript
const { error } = await supabase
  .from('cart_items')
  .delete()
  .eq('session_id', sessionId);
```

---

## 🔐 Admin Endpoints (Authentication Required)

### Authentication Check

```typescript
// Check if user is admin
const { data: userRoles } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', userId)
  .eq('role', 'admin')
  .single();

const isAdmin = !!userRoles;
```

---

### 6. Yacht Management

#### Create Yacht
```typescript
const { data, error } = await supabase
  .from('yachts')
  .insert({
    name: name,
    description: description,
    main_image: imageUrl,
    capacity: capacity,
    price_per_day: pricePerDay,
    price_per_hour: pricePerHour,
    location: location,
    features: features, // Array of strings
    is_available: true
  })
  .select()
  .single();
```

#### Update Yacht
```typescript
const { data, error } = await supabase
  .from('yachts')
  .update({
    name: name,
    description: description,
    price_per_day: pricePerDay,
    is_available: isAvailable
    // ... other fields
  })
  .eq('id', yachtId)
  .select()
  .single();
```

#### Delete Yacht
```typescript
const { error } = await supabase
  .from('yachts')
  .delete()
  .eq('id', yachtId);
```

---

### 7. Booking Management

#### Get All Bookings
```typescript
const { data, error } = await supabase
  .from('bookings')
  .select(`
    *,
    yacht:yachts (
      name,
      main_image
    )
  `)
  .order('created_at', { ascending: false });
```

#### Update Booking Status
```typescript
const { data, error } = await supabase
  .from('bookings')
  .update({ status: 'confirmed' }) // or 'cancelled'
  .eq('id', bookingId)
  .select()
  .single();
```

#### Delete Booking
```typescript
const { error } = await supabase
  .from('bookings')
  .delete()
  .eq('id', bookingId);
```

---

### 8. Promotion Management

#### Create Promotion
```typescript
const { data, error } = await supabase
  .from('promotions')
  .insert({
    title: title,
    code: code, // Optional
    description: description,
    discount_percentage: discountPercentage,
    valid_from: validFrom,
    valid_until: validUntil,
    is_active: true
  })
  .select()
  .single();
```

#### Update Promotion
```typescript
const { data, error } = await supabase
  .from('promotions')
  .update({
    title: title,
    discount_percentage: discountPercentage,
    is_active: isActive
  })
  .eq('id', promotionId)
  .select()
  .single();
```

#### Delete Promotion
```typescript
const { error } = await supabase
  .from('promotions')
  .delete()
  .eq('id', promotionId);
```

---

### 9. Client Management

#### Get All Clients
```typescript
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .order('created_at', { ascending: false });
```

#### Update Client Profile
```typescript
const { data, error } = await supabase
  .from('profiles')
  .update({
    full_name: fullName,
    phone: phone
  })
  .eq('id', userId)
  .select()
  .single();
```

---

### 10. Cart Monitoring (Admin)

#### Get All Cart Items
```typescript
const { data, error } = await supabase
  .from('cart_items')
  .select(`
    *,
    yacht:yachts (
      name,
      main_image,
      capacity,
      location,
      features,
      price_per_day,
      price_per_hour
    )
  `)
  .order('created_at', { ascending: false });
```

#### Clear Old Carts (7+ days)
```typescript
const sevenDaysAgo = new Date();
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

const { error } = await supabase
  .from('cart_items')
  .delete()
  .lt('created_at', sevenDaysAgo.toISOString());
```

---

## 🔄 Real-Time Subscriptions

### Setup Real-Time Listener

```typescript
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

useEffect(() => {
  // Subscribe to table changes
  const channel = supabase
    .channel('table-name-changes')
    .on(
      'postgres_changes',
      {
        event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'table_name'
      },
      (payload) => {
        console.log('Change detected:', payload);
        
        // Handle the change
        switch(payload.eventType) {
          case 'INSERT':
            // New record added
            break;
          case 'UPDATE':
            // Record updated
            break;
          case 'DELETE':
            // Record deleted
            break;
        }
        
        // Reload data
        loadData();
      }
    )
    .subscribe();

  // Cleanup on unmount
  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

### Real-Time Events

```typescript
payload = {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE',
  new: { /* new record data */ },
  old: { /* old record data (UPDATE/DELETE only) */ },
  schema: 'public',
  table: 'table_name'
}
```

---

## 🎯 Complete Feature Implementation Examples

### Example 1: Display Yachts with Promotions on Home Page

```typescript
const [yachts, setYachts] = useState([]);
const [promotions, setPromotions] = useState([]);

useEffect(() => {
  const loadData = async () => {
    // Fetch yachts
    const { data: yachtsData } = await supabase
      .from('yachts')
      .select('*')
      .eq('is_available', true)
      .order('created_at', { ascending: false });

    // Fetch active promotions
    const { data: promosData } = await supabase
      .from('promotions')
      .select('*')
      .eq('is_active', true)
      .gte('valid_until', new Date().toISOString());

    setYachts(yachtsData || []);
    setPromotions(promosData || []);
  };

  loadData();

  // Real-time updates
  const yachtsChannel = supabase
    .channel('yachts-updates')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'yachts' },
      () => loadData()
    )
    .subscribe();

  const promosChannel = supabase
    .channel('promotions-updates')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'promotions' },
      () => loadData()
    )
    .subscribe();

  return () => {
    supabase.removeChannel(yachtsChannel);
    supabase.removeChannel(promosChannel);
  };
}, []);

// Display yacht with promotion
yachts.map(yacht => {
  const activePromo = promotions.find(p => 
    p.is_active && 
    new Date(p.valid_from) <= new Date() &&
    new Date(p.valid_until) >= new Date()
  );
  
  return (
    <YachtCard
      yacht={yacht}
      discount={activePromo?.discount_percentage}
    />
  );
});
```

---

### Example 2: Admin Updates Yacht Price (Reflects Instantly)

```typescript
// Admin Dashboard
const updateYachtPrice = async (yachtId: string, newPrice: number) => {
  const { error } = await supabase
    .from('yachts')
    .update({ price_per_day: newPrice })
    .eq('id', yachtId);

  if (error) {
    toast.error('Failed to update price');
  } else {
    toast.success('Price updated!');
    // No manual refresh needed - real-time subscription handles it
  }
};

// Client Home Page
// Real-time listener automatically detects the change
// and reloads the yacht data, showing the new price instantly
```

---

### Example 3: Guest Cart with Price Calculation

```typescript
const addToCart = async (yacht, startDate, endDate) => {
  // Calculate days
  const days = Math.ceil(
    (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
  );
  
  // Calculate price
  const totalPrice = yacht.price_per_day * days;
  
  // Apply promotion if available
  const activePromo = promotions.find(p => p.is_active);
  const finalPrice = activePromo 
    ? totalPrice * (1 - activePromo.discount_percentage / 100)
    : totalPrice;

  // Add to cart
  const sessionId = localStorage.getItem('cart_session_id') || 
    crypto.randomUUID();
  localStorage.setItem('cart_session_id', sessionId);

  const { error } = await supabase
    .from('cart_items')
    .insert({
      session_id: sessionId,
      yacht_id: yacht.id,
      start_date: startDate,
      end_date: endDate,
      price: finalPrice
    });

  if (!error) {
    toast.success('Added to cart!');
  }
};
```

---

## 🛡️ Error Handling

### Standard Error Response

```typescript
const { data, error } = await supabase
  .from('table_name')
  .select();

if (error) {
  console.error('Database error:', error);
  
  // Common error codes
  switch(error.code) {
    case '23505': // Unique constraint violation
      toast.error('This record already exists');
      break;
    case '23503': // Foreign key violation
      toast.error('Referenced record does not exist');
      break;
    case 'PGRST116': // No rows found
      toast.info('No data available');
      break;
    default:
      toast.error('An error occurred');
  }
}
```

---

## 📊 Complete Data Flow Diagram

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │
       │ Supabase Client
       │
       ↓
┌─────────────────────────────────┐
│      Supabase Backend           │
│                                 │
│  ┌─────────────────────────┐   │
│  │   Row Level Security    │   │
│  │   (RLS Policies)        │   │
│  └───────────┬─────────────┘   │
│              ↓                  │
│  ┌─────────────────────────┐   │
│  │   PostgreSQL Database   │   │
│  │   - yachts              │   │
│  │   - bookings            │   │
│  │   - promotions          │   │
│  │   - cart_items          │   │
│  └─────────────────────────┘   │
│              │                  │
│              ↓                  │
│  ┌─────────────────────────┐   │
│  │   Realtime Engine       │   │
│  │   (Broadcasts Changes)  │   │
│  └───────────┬─────────────┘   │
└──────────────┼─────────────────┘
               │
               │ WebSocket
               │
               ↓
       ┌───────────────┐
       │   All Clients  │
       │  (Auto Update) │
       └───────────────┘
```

---

## ✅ Testing Checklist

### Public Features
- [ ] Browse yachts without authentication
- [ ] View active promotions
- [ ] Add yachts to cart
- [ ] Cart persists across sessions
- [ ] Create booking as guest
- [ ] Real-time price updates visible

### Admin Features
- [ ] Login as admin
- [ ] Create new yacht → appears instantly on home page
- [ ] Update yacht price → price updates live
- [ ] Activate promotion → discount applies immediately
- [ ] Accept booking → status updates in real-time
- [ ] View cart items from all sessions

---

## 🔗 Additional Resources

- [Supabase JavaScript Client Docs](https://supabase.com/docs/reference/javascript)
- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

**Last Updated:** 2025-10-19  
**Status:** Production Ready ✅
