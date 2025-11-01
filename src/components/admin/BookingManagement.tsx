import { useState, useMemo, useEffect } from 'react';
import { Booking, Yacht } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Trash2, Calendar, User, Phone, Mail, MessageCircle, Clock, Ship, Edit, Plus } from 'lucide-react';
import { bookingService } from '@/lib/storage';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

interface BookingManagementProps {
  bookings: Booking[];
  yachts: Yacht[];
  onUpdate: () => void;
  onEdit?: (booking: Booking) => void;
  onCreateNew?: () => void;
}

export const BookingManagement = ({ bookings, yachts, onUpdate, onEdit, onCreateNew }: BookingManagementProps) => {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [bookingOptionsById, setBookingOptionsById] = useState<Record<string, { option_name: string; option_price: number }[]>>({});

  useEffect(() => {
    const loadBookingOptions = async () => {
      try {
        const ids = bookings.map((b) => b.id).filter(Boolean);
        if (ids.length === 0) return;
        const { data, error } = await supabase
          .from('booking_options')
          .select('booking_id, option_name, option_price')
          .in('booking_id', ids);
        if (error) throw error;
        const map: Record<string, { option_name: string; option_price: number }[]> = {};
        (data || []).forEach((row: any) => {
          const arr = map[row.booking_id] || [];
          arr.push({ option_name: row.option_name, option_price: row.option_price });
          map[row.booking_id] = arr;
        });
        setBookingOptionsById(map);
      } catch (e) {
        console.error('Error loading booking options', e);
      }
    };
    loadBookingOptions();
  }, [bookings]);

  // 🧭 Map yacht IDs to names for quick lookup
  const yachtMap = useMemo(() => {
    const map = new Map<string, string>();
    yachts.forEach((y) => {
      if (y && y.id) map.set(y.id, y.name || '');
    });
    return map;
  }, [yachts]);

  // 🔍 Filter bookings by search input
  const filteredBookings = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return bookings;
    return bookings.filter((b) => {
      const fields = [
        b.id,
        b.customer_name,
        b.customer_email,
        b.customer_phone,
        b.status,
        b.booking_source,
        yachtMap.get(b.yacht_id || '') || '',
      ];
      return fields.some((f) => (f || '').toLowerCase().includes(q));
    });
  }, [bookings, search, yachtMap]);

  // ✅ Update status
  const handleStatusUpdate = async (id: string, status: 'confirmed' | 'cancelled') => {
    try {
      await bookingService.updateBookingStatus(id, status);
      toast.success(t('تم تحديث حالة الحجز', 'Booking status updated'));
      onUpdate();
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error(t('حدث خطأ في تحديث الحجز', 'Error updating booking'));
    }
  };

  // 🗑️ Delete booking
  const handleDelete = async (id: string) => {
    if (confirm(t('هل أنت متأكد من حذف هذا الحجز؟', 'Are you sure you want to delete this booking?'))) {
      try {
        await bookingService.deleteBooking(id);
        toast.success(t('تم حذف الحجز بنجاح', 'Booking deleted successfully'));
        onUpdate();
      } catch (error) {
        console.error('Error deleting booking:', error);
        toast.error(t('حدث خطأ في حذف الحجز', 'Error deleting booking'));
      }
    }
  };

  // 🎨 Color based on booking status
  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (bookings.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <p className="text-xl text-muted-foreground">
          {t('لا توجد حجوزات حتى الآن', 'No bookings yet')}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-2xl font-bold text-primary">
          {t('إدارة الحجوزات', 'Booking Management')}
        </h2>
        <div className="flex items-center gap-2 ml-auto">
          <Input
            placeholder={t('ابحث في الحجوزات...', 'Search bookings...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-56"
          />
          <Button variant="outline" onClick={() => setSearch('')}>
            {t('مسح', 'Clear')}
          </Button>
        </div>
        {onCreateNew && (
          <Button onClick={onCreateNew} className="bg-gradient-ocean">
            <Plus className="w-4 h-4 ml-2" />
            {t('حجز جديد', 'Create New Booking')}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredBookings.map((booking) => (
          <Card key={booking.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold">
                    {t('حجز', 'Booking')} #{booking.id.slice(0, 8)}
                  </h3>
                  <Badge className={getStatusColor(booking.status)}>
                    {booking.status}
                  </Badge>
                  {booking.booking_source === 'whatsapp' && (
                    <Badge variant="outline" className="border-green-600 text-green-600">
                      <MessageCircle className="w-3 h-3 mr-1" />
                      WhatsApp
                    </Badge>
                  )}
                </div>

                {booking.yacht_id && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Ship className="w-4 h-4" />
                    <span className="font-medium">{t('اليخت:', 'Yacht:')}</span>
                    <span>{yachtMap.get(booking.yacht_id) || t('غير محدد', 'Not specified')}</span>
                  </div>
                )}

                {Array.isArray(bookingOptionsById[booking.id]) && bookingOptionsById[booking.id].length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-muted-foreground mb-1">{t('الخيارات المختارة', 'Selected Options')}</p>
                    <div className="flex flex-wrap gap-2">
                      {bookingOptionsById[booking.id].map((opt, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {opt.option_name} · {opt.option_price} AED
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-sm text-muted-foreground">
                  {t('رقم الحجز:', 'Booking ID:')} {booking.id}
                </p>
              </div>

              <div className="flex gap-2">
                {booking.status === 'pending' && (
                  <>
                    <Button
                      onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                      variant="default"
                      size="sm"
                    >
                      {t('قبول', 'Accept')}
                    </Button>
                    <Button
                      onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                      variant="outline"
                      size="sm"
                    >
                      {t('رفض', 'Reject')}
                    </Button>
                  </>
                )}
                {onEdit && (
                  <Button
                    onClick={() => onEdit(booking)}
                    variant="outline"
                    size="sm"
                  >
                    <Edit className="w-4 h-4 ml-1" />
                    {t('تعديل', 'Edit')}
                  </Button>
                )}
                <Button
                  onClick={() => handleDelete(booking.id)}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="w-4 h-4 ml-1" />
                  {t('حذف', 'Delete')}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{t('العميل:', 'Customer:')}</span>
                  <span>{booking.customer_name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{t('البريد:', 'Email:')}</span>
                  <span>{booking.customer_email}</span>
                </div>
                {booking.customer_phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{t('الهاتف:', 'Phone:')}</span>
                    <span dir="ltr">{booking.customer_phone}</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{t('من:', 'From:')}</span>
                  <span dir="ltr">{new Date(booking.start_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{t('إلى:', 'To:')}</span>
                  <span dir="ltr">{new Date(booking.end_date).toLocaleDateString()}</span>
                </div>
                {booking.duration_type && (
                  <div className="text-sm space-y-1">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{t('نوع الإيجار:', 'Type:')}</span>
                      <span>
                        {booking.duration_type === 'hourly'
                          ? t('بالساعة', 'Hourly')
                          : t('يومي', 'Daily')}
                        {booking.duration_value &&
                          ` (${booking.duration_type === 'hourly'
                            ? `${booking.duration_value} ${t('ساعات', 'hours')}`
                            : `${booking.duration_value} ${t('أيام', 'days')}`})`}
                      </span>
                    </div>
                    {Array.isArray(bookingOptionsById[booking.id]) && bookingOptionsById[booking.id].length > 0 && (
                      <div className="pl-6 text-muted-foreground">
                        <span className="font-medium mr-1">{t('الخيار/الخيارات:', 'Option(s):')}</span>
                        <span>
                          {bookingOptionsById[booking.id]
                            .map(o => `${o.option_name} (+${o.option_price} AED)`)
                            .join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">
                    {t('المبلغ الإجمالي:', 'Total Amount:')}
                  </span>
                  <span className="text-lg font-bold text-secondary">
                    ${booking.total_price}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
