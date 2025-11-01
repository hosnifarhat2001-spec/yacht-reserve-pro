import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { format, parseISO } from 'date-fns';
import { CalendarIcon, Edit, Plus } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

// Mock data - in a real app, this would come from an API
const mockYachts = [
  { id: 'y1', name: 'Ocean Dream' },
  { id: 'y2', name: 'Sea Breeze' },
  { id: 'y3', name: 'Royal Voyager' },
];
interface Booking {
  id?: string;
  yacht_id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  booking_date: string;
  end_time: string;
  notes?: string;
  status: string;
  yacht_name?: string;
  total_price?: number;
  user_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface CreateBookingFormProps {
  onSuccess?: () => void;
  booking?: Booking | null;
}

export const CreateBookingForm = ({ onSuccess, booking }: CreateBookingFormProps) => {
  const [open, setOpen] = useState(!booking);
  const [yachts, setYachts] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(false);

  // Initialize form with booking data or defaults
  const [formData, setFormData] = useState(() => ({
    yacht_id: booking?.yacht_id || '',
    client_name: booking?.client_name || '',
    client_email: booking?.client_email || '',
    client_phone: booking?.client_phone || '',
    booking_date: booking?.booking_date || new Date().toISOString(),
    end_time: booking?.end_time || new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    notes: booking?.notes || '',
    status: booking?.status || 'pending',
  }));

  // Fetch yachts from Supabase
  useEffect(() => {
    const fetchYachts = async () => {
      const { data, error } = await supabase
        .from('yachts')
        .select('id, name')
        .order('name');
      
      if (!error && data) {
        setYachts(data);
      }
    };
    
    fetchYachts();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Transform form data to match database schema
      const bookingData = {
        ...(booking?.id && { id: booking.id }),
        customer_name: formData.client_name,
        customer_email: formData.client_email,
        customer_phone: formData.client_phone,
        start_date: new Date(formData.booking_date).toISOString(),
        end_date: new Date(formData.end_time).toISOString(),
        yacht_id: formData.yacht_id,
        notes: formData.notes,
        status: formData.status,
        // Add required fields with default values if not provided
        total_price: booking?.total_price || 0,
        user_id: booking?.user_id || null,
        created_at: booking?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Submitting booking data:', bookingData);

      // Update or create booking in Supabase
      const { error } = booking?.id
        ? await supabase.from('bookings').update(bookingData).eq('id', booking.id)
        : await supabase.from('bookings').insert([bookingData]);

      if (error) throw error;
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      // Close dialog if this is a modal
      if (!booking) {
        setOpen(false);
      }
    } catch (error) {
      console.error('Error saving booking:', error);
      // TODO: Show error to user
    } finally {
      setLoading(false);
    }
  };

  if (!open && !booking) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        New Booking
      </Button>
    );
  }

  if (booking && !open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Edit className="mr-2 h-4 w-4" />
        Edit Booking
      </Button>
    );
  }

  // Format dates for display
  const formatDateForInput = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toISOString().slice(0, 16);
    } catch (e) {
      return new Date().toISOString().slice(0, 16);
    }
  };

  // Handle edit button click
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(true);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild onClick={handleEditClick}>
        {booking ? (
          <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
            <Edit className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="mr-2 h-4 w-4" /> New Booking
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {booking?.id ? (
              <>
                <Edit className="h-5 w-5" />
                <span>Edit Booking</span>
              </>
            ) : (
              <>
                <Plus className="h-5 w-5" />
                <span>New Booking</span>
              </>
            )}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="yacht_id" className="text-right">
                  Yacht
                </Label>
                <select
                  id="yacht_id"
                  name="yacht_id"
                  value={formData.yacht_id}
                  onChange={handleChange}
                  className="col-span-3"
                >
                  <option value="">Select a yacht</option>
                  {yachts.map((yacht) => (
                    <option key={yacht.id} value={yacht.id}>
                      {yacht.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="booking_date" className="text-right">
                  Start Date & Time
                </Label>
                <Input
                  id="booking_date"
                  type="datetime-local"
                  className="col-span-3"
                  value={formatDateForInput(formData.booking_date)}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="end_time" className="text-right">
                  End Date & Time
                </Label>
                <Input
                  id="end_time"
                  type="datetime-local"
                  className="col-span-3"
                  value={formatDateForInput(formData.end_time)}
                  onChange={handleChange}
                  min={formData.booking_date}
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="col-span-3"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="client_name" className="text-right">
                  Client Name
                </Label>
                <Input
                  id="client_name"
                  name="client_name"
                  value={formData.client_name}
                  onChange={handleChange}
                  className="col-span-3"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="client_email" className="text-right">
                  Email
                </Label>
                <Input
                  id="client_email"
                  type="email"
                  name="client_email"
                  value={formData.client_email}
                  onChange={handleChange}
                  className="col-span-3"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="client_phone" className="text-right">
                  Phone
                </Label>
                <Input
                  id="client_phone"
                  name="client_phone"
                  value={formData.client_phone}
                  onChange={handleChange}
                  className="col-span-3"
                  required
                />
              </div>

              <div className="grid grid-cols-4 gap-4">
                <Label htmlFor="notes" className="text-right pt-2">
                  Notes
                </Label>
                <div className="col-span-3">
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type={booking?.id ? 'button' : 'submit'}
              onClick={booking?.id ? () => alert('Edit functionality coming soon') : undefined}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Saving...' : booking?.id ? 'Edit functionality coming soon' : 'Create Booking'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBookingForm;
