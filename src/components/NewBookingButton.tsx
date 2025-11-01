import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { BookingModal } from './BookingModal';
import { Yacht } from '@/types';

export const NewBookingButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedYacht, setSelectedYacht] = useState<Yacht | null>(null);

  // This would typically come from your data fetching logic
  const demoYacht: Yacht = {
    id: 'demo-yacht',
    name: 'Luxury Yacht',
    description: 'Experience luxury on the water',
    price_per_hour: 1000,
    price_per_day: 10000, // Added missing required field
    capacity: 10,
    length: 50,
    main_image: '/yacht-placeholder.jpg',
    features: ['Luxury Cabin', 'Sun Deck', 'Jacuzzi'],
    is_available: true,
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSelectedYacht(null);
    }
  };

  return (
    <>
      <Button 
        onClick={() => {
          setSelectedYacht(demoYacht);
          setIsOpen(true);
        }}
        className="fixed bottom-6 right-6 z-50 rounded-full h-14 w-14 p-0 shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <PlusCircle className="h-10 w-10" />
        <span className="sr-only">Create New Booking</span>
      </Button>

      {selectedYacht && (
        <BookingModal
          yacht={selectedYacht}
          open={isOpen}
          onClose={() => handleOpenChange(false)}
        />
      )}
    </>
  );
};

export default NewBookingButton;
