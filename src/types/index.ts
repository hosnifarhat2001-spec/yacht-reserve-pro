export interface Yacht {
  id: string;
  name: string;
  description: string;
  description_ar?: string;
  main_image: string;
  capacity: number;
  length?: number;
  price_per_day: number;
  price_per_hour: number;
  features?: string[];
  location?: string;
  is_available?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Booking {
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
  booking_source?: 'direct' | 'whatsapp';
  duration_type?: 'hourly' | 'daily';
  duration_value?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Promotion {
  id: string;
  title: string;
  code?: string;
  description?: string;
  discount_percentage?: number;
  discount_amount?: number;
  valid_from?: string;
  valid_until?: string;
  is_active: boolean;
  yacht_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Client {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  createdAt: string;
}

export interface YachtOption {
  id: string;
  yacht_id: string;
  name: string;
  price: number;
  description?: string;
  is_active?: boolean;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Language {
  code: 'ar' | 'en';
  dir: 'rtl' | 'ltr';
}
