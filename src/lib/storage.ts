import { supabase } from '@/integrations/supabase/client';
import { Yacht, Booking, Promotion, Client } from '@/types';

export const settingsService = {
  async getWhatsAppNumber(): Promise<string> {
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'whatsapp_number')
      .maybeSingle();

    if (error) throw error;
    return data?.value || '';
  },

  async saveWhatsAppNumber(phoneNumber: string): Promise<void> {
    const { error } = await supabase
      .from('site_settings')
      .upsert({
        key: 'whatsapp_number',
        value: phoneNumber,
        type: 'text'
      }, {
        onConflict: 'key'
      });

    if (error) throw error;
  },
};

export const yachtService = {
  async getYachts(): Promise<Yacht[]> {
    const { data, error } = await supabase
      .from('yachts')
      .select('*')
      .order('created_at', { ascending: false});

    if (error) throw error;
    
    // Database columns match TypeScript interface - no transformation needed
    return data || [];
  },

  async addYacht(yacht: Omit<Yacht, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    const { error } = await supabase
      .from('yachts')
      .insert(yacht);

    if (error) throw error;
  },

  async updateYacht(id: string, updates: Partial<Yacht>): Promise<void> {
    const { error } = await supabase
      .from('yachts')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  },

  async deleteYacht(id: string): Promise<void> {
    const { error } = await supabase
      .from('yachts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

export const bookingService = {
  // Get all bookings
  async getBookings(): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(booking => ({
      ...booking,
      status: booking.status as 'pending' | 'confirmed' | 'cancelled',
      booking_source: booking.booking_source as 'direct' | 'whatsapp',
      duration_type: booking.duration_type as 'hourly' | 'daily'
    }));
  },

  // Get user's bookings
  async getUserBookings(userId: string): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(booking => ({
      ...booking,
      status: booking.status as 'pending' | 'confirmed' | 'cancelled',
      booking_source: booking.booking_source as 'direct' | 'whatsapp',
      duration_type: booking.duration_type as 'hourly' | 'daily'
    }));
  },

  // Create a booking (supports both authenticated users and guests)
  async addBooking(booking: Omit<Booking, 'id' | 'status' | 'created_at' | 'updated_at'>, userId?: string): Promise<void> {
    const { error } = await supabase
      .from('bookings')
      .insert({
        yacht_id: booking.yacht_id,
        user_id: userId || null,
        customer_name: booking.customer_name,
        customer_email: booking.customer_email,
        customer_phone: booking.customer_phone,
        start_date: booking.start_date,
        end_date: booking.end_date,
        total_price: booking.total_price,
        booking_source: booking.booking_source || 'direct',
        duration_type: booking.duration_type || 'daily',
        duration_value: booking.duration_value,
        status: 'pending',
      });

    if (error) throw error;
  },

  // Update booking status
  async updateBookingStatus(id: string, status: 'pending' | 'confirmed' | 'cancelled'): Promise<void> {
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
  },

  // Delete a booking
  async deleteBooking(id: string): Promise<void> {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

export const promotionService = {
  async getPromotions(): Promise<Promotion[]> {
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  },

  async addPromotion(promotion: Omit<Promotion, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    console.log('Adding promotion to database:', promotion);
    
    const { error } = await supabase
      .from('promotions')
      .insert({
        title: promotion.title,
        code: promotion.code || null,
        description: promotion.description || null,
        discount_percentage: promotion.discount_percentage,
        discount_amount: promotion.discount_amount || null,
        valid_from: promotion.valid_from || null,
        valid_until: promotion.valid_until || null,
        is_active: promotion.is_active,
        yacht_id: promotion.yacht_id || null,
      });

    if (error) {
      console.error('Database error adding promotion:', error);
      throw error;
    }
    console.log('Promotion added successfully');
  },

  async updatePromotion(id: string, updates: Partial<Promotion>): Promise<void> {
    const { error } = await supabase
      .from('promotions')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  },

  async deletePromotion(id: string): Promise<void> {
    const { error } = await supabase
      .from('promotions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

export const clientService = {
  async getClients(): Promise<Client[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((client: any) => ({
      id: client.id,
      userId: client.id,
      fullName: client.full_name || '',
      email: '', // Email is in auth.users, not profiles
      phone: client.phone || '',
      createdAt: client.created_at,
    }));
  },

  async updateClient(id: string, updates: Partial<Client>): Promise<void> {
    const updateData: any = {};
    if (updates.fullName !== undefined) updateData.full_name = updates.fullName;
    if (updates.phone !== undefined) updateData.phone = updates.phone;

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;
  },

  async deleteClient(id: string): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
