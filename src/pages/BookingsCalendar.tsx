import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, isSameDay, parseISO } from 'date-fns';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CreateBookingForm } from '@/components/CreateBookingForm';
import { fr } from 'date-fns/locale';
import { arSA } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { CalendarDays } from 'lucide-react';

export default function BookingsCalendar() {
  const [date, setDate] = useState<Date>(new Date());
  const [bookings, setBookings] = useState<any[]>([]);
  const [editingBooking, setEditingBooking] = useState<any | null>(null);
  const [selectedBookings, setSelectedBookings] = useState<any[]>([]);
  const { t, language } = useLanguage();

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    // Filter bookings for the selected date
    if (date && bookings.length > 0) {
      const filtered = bookings.filter(booking => {
        const bookingDate = new Date(booking.booking_date);
        return isSameDay(bookingDate, date);
      });
      setSelectedBookings(filtered);
    } else {
      setSelectedBookings([]);
    }
  }, [date, bookings]);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('booking_date', { ascending: true });

      if (error) throw error;
      
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const getBookedDays = (date: Date) => {
    return bookings.some(booking => {
      const bookingDate = new Date(booking.booking_date);
      return isSameDay(bookingDate, date);
    });
  };

  const dayContent = (day: Date) => {
    const hasBooking = getBookedDays(day);
    return (
      <div className="relative">
        {format(day, 'd')}
        {hasBooking && (
          <span className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full"></span>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/2 lg:w-1/3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                {t('bookingsCalendar.title', 'Bookings Calendar')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && setDate(newDate)}
                className="rounded-md border"
                locale={language.code === 'ar' ? fr : undefined}
                components={{
                  DayContent: (props) => (
                    <div className="relative w-full h-full">
                      {dayContent(props.date)}
                    </div>
                  ),
                }}
              />
            </CardContent>
          </Card>
        </div>

        <div className="w-full md:w-1/2 lg:w-2/3">
          <Card>
            <CardHeader>
              <CardTitle>
                {t('bookingsCalendar.bookingsFor', 'Bookings for')} {format(date, 'PPP', { locale: language.code === 'ar' ? arSA : undefined })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedBookings.length > 0 ? (
                <div className="space-y-4">
                  {selectedBookings.map((booking) => (
                    <div key={booking.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{booking.client_name}</h3>
                          <p className="text-sm text-gray-500">{booking.yacht_name || 'N/A'}</p>
                          <p className="text-sm">
                            {format(new Date(booking.booking_date), 'HH:mm')} - {format(new Date(booking.end_time), 'HH:mm')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            booking.status === 'confirmed' 
                              ? 'bg-green-100 text-green-800' 
                              : booking.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {booking.status}
                          </span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingBooking(booking);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit booking</span>
                          </Button>
                        </div>
                      </div>
                      {booking.notes && (
                        <p className="mt-2 text-sm text-gray-600">{booking.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">
                  {t('bookingsCalendar.noBookings', 'No bookings for this date.')}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={!!editingBooking} onOpenChange={(open) => !open && setEditingBooking(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Booking</DialogTitle>
          </DialogHeader>
          {editingBooking && (
            <CreateBookingForm 
              booking={{
                ...editingBooking,
                booking_date: parseISO(editingBooking.booking_date),
                end_time: parseISO(editingBooking.end_time)
              }}
              onSuccess={() => {
                setEditingBooking(null);
                // Refresh bookings data
                fetchBookings();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
