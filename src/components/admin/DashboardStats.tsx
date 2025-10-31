import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Ship, UtensilsCrossed, Settings, Users, Calendar as CalendarIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { format, isSameDay } from 'date-fns';

interface DashboardStatsProps {
  totalYachts: number;
  totalFood: number;
  totalWaterSports: number;
  totalAdditionalServices: number;
  bookings?: any[];
  yachts?: any[];
}

export const DashboardStats = ({
  totalYachts,
  totalFood,
  totalWaterSports,
  totalAdditionalServices,
  bookings = [],
  yachts = [],
}: DashboardStatsProps) => {
  const { t } = useLanguage();
  const [date, setDate] = useState<Date | undefined>(new Date());

  // Create a map of yacht IDs to names
  const yachtMap = useMemo(() => {
    const map = new Map<string, string>();
    yachts.forEach((y) => {
      if (y && y.id) map.set(y.id, y.name || '');
    });
    return map;
  }, [yachts]);

  // Get bookings for the selected date
  const selectedDateBookings = useMemo(() => {
    if (!date) return [];
    return bookings.filter((booking) => {
      const startDate = new Date(booking.start_date);
      const endDate = new Date(booking.end_date);
      return date >= startDate && date <= endDate;
    });
  }, [date, bookings]);

  // Get dates with bookings for calendar highlighting
  const bookingDates = useMemo(() => {
    const dates = new Set<string>();
    bookings.forEach((booking) => {
      const start = new Date(booking.start_date);
      const end = new Date(booking.end_date);
      
      // Add all dates in the booking range
      const current = new Date(start);
      while (current <= end) {
        dates.add(format(current, 'yyyy-MM-dd'));
        current.setDate(current.getDate() + 1);
      }
    });
    return dates;
  }, [bookings]);

  // Custom day content to show booking indicators
  const modifiers = {
    booked: (day: Date) => bookingDates.has(format(day, 'yyyy-MM-dd'))
  };

  const modifiersStyles = {
    booked: {
      fontWeight: 'bold' as const,
      color: 'rgb(255, 122, 48)',
    }
  };

  const getStatusColor = (status: string) => {
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

  const stats = [
    {
      title: t('إجمالي اليخوت', 'Total Yachts'),
      value: totalYachts,
      icon: Ship,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100',
    },
    {
      title: t('إجمالي الطعام', 'Total Food'),
      value: totalFood,
      icon: UtensilsCrossed,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
    {
      title: t('إجمالي الرياضات المائية', 'Total Water Sports'),
      value: totalWaterSports,
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
    {
      title: t('إجمالي الخدمات الإضافية', 'Total Additional Services'),
      value: totalAdditionalServices,
      icon: Settings,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    },
  ];

  return (
    <div className="space-y-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-2">
          <h3 className="text-xl font-bold mb-4 text-primary">
            {t('التقويم - الحجوزات', 'Calendar - Bookings')}
          </h3>
          <div className="flex justify-center mb-4">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              className="rounded-md border shadow-sm"
            />
          </div>
          <div className="flex items-center gap-4 justify-center text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[rgb(255,122,48)]"></div>
              <span>{t('يوم به حجوزات', 'Day with bookings')}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4 text-primary flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            {date ? format(date, 'MMM dd, yyyy') : t('اختر تاريخ', 'Select a date')}
          </h3>
          
          {selectedDateBookings.length > 0 ? (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {selectedDateBookings.map((booking) => (
                <Card key={booking.id} className="p-4 bg-muted/30">
                  <div className="flex items-start justify-between mb-2">
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      #{booking.id.slice(0, 8)}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-semibold">{t('العميل:', 'Customer:')}</span>
                      <p className="text-muted-foreground">{booking.customer_name}</p>
                    </div>
                    
                    {booking.yacht_id && (
                      <div>
                        <span className="font-semibold">{t('اليخت:', 'Yacht:')}</span>
                        <p className="text-muted-foreground">
                          {yachtMap.get(booking.yacht_id) || t('غير محدد', 'Not specified')}
                        </p>
                      </div>
                    )}
                    
                    <div>
                      <span className="font-semibold">{t('الفترة:', 'Period:')}</span>
                      <p className="text-muted-foreground">
                        {format(new Date(booking.start_date), 'MMM dd')} - {format(new Date(booking.end_date), 'MMM dd')}
                      </p>
                    </div>
                    
                    {booking.trip_start_time && booking.trip_end_time && (
                      <div>
                        <span className="font-semibold">{t('الوقت:', 'Time:')}</span>
                        <p className="text-muted-foreground">
                          {booking.trip_start_time} - {booking.trip_end_time}
                        </p>
                      </div>
                    )}
                    
                    <div>
                      <span className="font-semibold">{t('المبلغ:', 'Amount:')}</span>
                      <p className="text-secondary font-bold">
                        {booking.total_price} AED
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>{t('لا توجد حجوزات في هذا التاريخ', 'No bookings on this date')}</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
