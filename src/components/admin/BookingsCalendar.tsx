import { useState } from 'react';
import { format, startOfWeek, addDays, isSameDay, isSameMonth, isToday } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Booking } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface BookingsCalendarProps {
  bookings: Booking[];
  onDateSelect: (date: Date) => void;
}

export const BookingsCalendar = ({ bookings, onDateSelect }: BookingsCalendarProps) => {
  const { currentLanguage } = useLanguage();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const renderHeader = () => {
    const dateFormat = 'MMMM yyyy';
    return (
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentMonth(addDays(startOfWeek(currentMonth), -7))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-semibold">
          {format(currentMonth, dateFormat, { locale: currentLanguage === 'ar' ? ar : enUS })}
        </h2>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentMonth(addDays(startOfWeek(currentMonth, { weekStartsOn: 0 }), 7))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  const renderDays = () => {
    const dateFormat = 'EEEE';
    const days = [];
    const startDate = startOfWeek(currentMonth, { weekStartsOn: 0 });

    for (let i = 0; i < 7; i++) {
      days.push(
        <div className="text-center font-medium text-sm py-2" key={i}>
          {format(addDays(startDate, i), dateFormat, { locale: currentLanguage === 'ar' ? ar : enUS })}
        </div>
      );
    }

    return <div className="grid grid-cols-7 mb-2">{days}</div>;
  };

  const renderCells = () => {
    const startDate = startOfWeek(currentMonth, { weekStartsOn: 0 });
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = '';

    for (let week = 0; week < 6; week++) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, 'd');
        const cloneDay = day;
        const dayBookings = bookings.filter(booking => 
          isSameDay(new Date(booking.start_date), day) || 
          isSameDay(new Date(booking.end_date), day) ||
          (new Date(booking.start_date) <= day && new Date(booking.end_date) >= day)
        );

        days.push(
          <div
            className={`
              min-h-24 p-2 border border-border rounded-md
              ${!isSameMonth(day, currentMonth) ? 'text-muted-foreground bg-muted/50' : ''}
              ${isToday(day) ? 'bg-accent/20' : ''}
              ${isSameDay(day, selectedDate) ? 'ring-2 ring-primary' : ''}
              transition-colors cursor-pointer hover:bg-accent/10
            `}
            key={day.toString()}
            onClick={() => {
              setSelectedDate(cloneDay);
              onDateSelect(cloneDay);
            }}
          >
            <div className="flex justify-between items-start">
              <span className={`text-sm font-medium ${isToday(day) ? 'text-primary' : ''}`}>
                {formattedDate}
              </span>
              {dayBookings.length > 0 && (
                <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {dayBookings.length}
                </Badge>
              )}
            </div>
            <div className="mt-1 space-y-1 max-h-16 overflow-y-auto pr-1">
              {dayBookings.slice(0, 2).map((booking, idx) => (
                <div 
                  key={idx} 
                  className="text-xs p-1 bg-primary/10 text-primary-foreground rounded truncate"
                  title={`${booking.customer_name} - ${booking.notes || 'No notes'}`}
                >
                  {booking.customer_name}
                </div>
              ))}
              {dayBookings.length > 2 && (
                <div className="text-xs text-muted-foreground text-center">
                  +{dayBookings.length - 2} more
                </div>
              )}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7 gap-1" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="space-y-1">{rows}</div>;
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Bookings Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        {renderHeader()}
        {renderDays()}
        {renderCells()}
      </CardContent>
    </Card>
  );
};

export default BookingsCalendar;
