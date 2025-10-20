import { Booking } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Calendar, User, Phone, Mail, MessageCircle, Clock } from 'lucide-react';
import { bookingService } from '@/lib/storage';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

interface BookingManagementProps {
  bookings: Booking[];
  onUpdate: () => void;
}

export const BookingManagement = ({ bookings, onUpdate }: BookingManagementProps) => {
  const { t, language } = useLanguage();

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
      <h2 className="text-2xl font-bold text-primary">{t('إدارة الحجوزات', 'Booking Management')}</h2>

      <div className="grid grid-cols-1 gap-4">
        {bookings.map((booking) => (
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
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{t('نوع الإيجار:', 'Type:')}</span>
                    <span>
                      {booking.duration_type === 'hourly' ? t('بالساعة', 'Hourly') : t('يومي', 'Daily')}
                      {booking.duration_value && ` (${booking.duration_value} ${booking.duration_type === 'hourly' ? t('ساعات', 'hours') : t('أيام', 'days')})`}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">{t('المبلغ الإجمالي:', 'Total Amount:')}</span>
                  <span className="text-lg font-bold text-secondary">${booking.total_price}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
