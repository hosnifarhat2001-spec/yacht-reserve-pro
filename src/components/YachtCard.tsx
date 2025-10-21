import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookingModal } from './BookingModal';
import { Yacht, Promotion, YachtOption } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { Ship, Users, Ruler, Calendar, ShoppingCart, Check } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';
import { promotionService } from '@/lib/storage';
import { supabase } from '@/integrations/supabase/client';

export const YachtCard = ({ yacht }: { yacht: Yacht }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t, language } = useLanguage();
  const { addToCart, removeFromCart, isInCart } = useCart();
  const inCart = isInCart(yacht.id);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [yachtOptions, setYachtOptions] = useState<YachtOption[]>([]);

  useEffect(() => {
    loadPromotions();
    loadYachtOptions();
  }, [yacht.id]);

  const loadPromotions = async () => {
    try {
      const data = await promotionService.getPromotions();
      // Filter for active promotions that either apply to all yachts or this specific yacht
      setPromotions(data.filter(p => p.is_active && (!p.yacht_id || p.yacht_id === yacht.id)));
    } catch (error) {
      console.error('Error loading promotions:', error);
    }
  };

  const loadYachtOptions = async () => {
    try {
      const { data } = await supabase
        .from('yacht_options')
        .select('*')
        .eq('yacht_id', yacht.id)
        .eq('is_active', true)
        .order('display_order');
      
      setYachtOptions(data || []);
    } catch (error) {
      console.error('Error loading yacht options:', error);
    }
  };

  const handleCartToggle = () => {
    console.log('Cart toggle clicked for yacht:', yacht);
    if (inCart) {
      removeFromCart(yacht.id);
      toast.success(t('تم الإزالة من القائمة', 'Removed from list'));
    } else {
      addToCart(yacht);
      toast.success(t('تم الإضافة إلى القائمة', 'Added to list'));
    }
  };

  const hasActivePromotion = promotions.length > 0;

  return (
    <>
      <Card className="overflow-hidden group hover:shadow-2xl transition-all duration-300 animate-fade-in h-full flex flex-col">
        <div className="relative overflow-hidden h-64">
          <img
            src={yacht.main_image || ''}
            alt={yacht.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        <div className="p-6 space-y-4 flex-1 flex flex-col">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-primary mb-2">
                {yacht.name}
              </h3>
              <p className="text-muted-foreground line-clamp-3 text-sm">
                {yacht.description}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="rounded-xl px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-600 text-white shadow-lg shrink-0">
                <div className="text-[11px] leading-none opacity-95">
                  {t('ابتداءً من', 'From')}
                </div>
                <div className="text-2xl font-extrabold leading-tight">
                  {Number(yacht.price_per_hour || 0).toFixed(0)}
                  <span className="text-sm font-semibold ml-1">AED</span>
                </div>
                <div className="text-[11px] leading-none opacity-95">
                  {t('للـساعة', 'per hour')}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 py-4 border-t border-b">
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-primary" />
              <span>{yacht.capacity} {t('أشخاص', 'Guests')}</span>
            </div>
            {yacht.length && yacht.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Ruler className="w-4 h-4 text-primary" />
                <span>{yacht.length}m {t('طول', 'Length')}</span>
              </div>
            )}
            {yacht.location && yacht.location.trim().length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Ship className="w-4 h-4 text-primary" />
                <span>{yacht.location}</span>
              </div>
            )}
          </div>

          {/* Display Yacht Options */}
          {yachtOptions.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-primary">
                {t('خيارات متاحة:', 'Available Options:')}
              </h4>
              <div className="flex flex-wrap gap-2">
                {yachtOptions.map((option) => (
                  <Badge key={option.id} variant="outline" className="text-xs">
                    {option.name} (+{option.price} AED)
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Display Yacht Features */}
          {yacht.features && yacht.features.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-primary">
                {t('مميزات اليخت:', 'Yacht Features:')}
              </h4>
              <div className="flex flex-wrap gap-2">
                {yacht.features.slice(0, 6).map((feature: string, idx: number) => (
                  <Badge key={idx} variant="outline" className="text-xs flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-auto">
            <Button
              onClick={() => setIsModalOpen(true)}
              className="flex-1 bg-gradient-ocean hover:opacity-90"
              size="lg"
            >
              <Calendar className="w-4 h-4 ml-2" />
              {t('احجز الآن', 'Book Now')}
            </Button>
          
          </div>
        </div>
      </Card>

      <BookingModal
        yacht={yacht}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
