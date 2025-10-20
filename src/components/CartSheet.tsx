import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ShoppingCart, Trash2, Calendar, Users, MapPin } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useLanguage } from '@/contexts/LanguageContext';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { BookingModal } from './BookingModal';
import { promotionService } from '@/lib/storage';
import { Promotion } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export const CartSheet = () => {
  const { items, removeFromCart, clearCart, getItemCount } = useCart();
  const { t, language } = useLanguage();
  const [selectedYacht, setSelectedYacht] = useState<any>(null);
  const [promotions, setPromotions] = useState<Promotion[]>([]);

  useEffect(() => {
    const loadPromotions = async () => {
      try {
        const promoData = await promotionService.getPromotions();
        // Filter for active promotions that apply to cart items
        const cartYachtIds = items.map(item => item.yacht.id);
        setPromotions(promoData.filter(p => 
          p.is_active && (!p.yacht_id || cartYachtIds.includes(p.yacht_id))
        ));
      } catch (error) {
        console.error('Error loading promotions:', error);
      }
    };
    loadPromotions();

    // Real-time subscription for promotions
    const promotionsChannel = supabase
      .channel('cart-promotions-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'promotions' },
        () => {
          loadPromotions(); // Reload promotions when they change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(promotionsChannel);
    };
  }, []);

  // Log cart items for debugging
  useEffect(() => {
    console.log('Cart items:', items);
  }, [items]);

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="relative">
            <ShoppingCart className="w-5 h-5" />
            {getItemCount() > 0 && (
              <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center">
                {getItemCount()}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center justify-between">
              <span>{t('قائمة الحجوزات', 'Booking List')}</span>
              {items.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearCart}>
                  {t('مسح الكل', 'Clear All')}
                </Button>
              )}
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {t('لا توجد يخوت في القائمة', 'No yachts in your list')}
                </p>
              </div>
            ) : (
              items.map((item) => {
                // Find promotion for this specific yacht or global promotion
                const activePromo = promotions.find(
                  p => p.is_active && (!p.yacht_id || p.yacht_id === item.yacht.id)
                );
                
                const yacht = item.yacht;
                const yachtName = yacht.name || '';
                const yachtDescription = yacht.description || '';
                const yachtImage = yacht.main_image || '';
                const pricePerDay = yacht.price_per_day || 0;
                const pricePerHour = yacht.price_per_hour;
                
                return (
                  <div key={yacht.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex gap-3">
                      {yachtImage && (
                        <img
                          src={yachtImage}
                          alt={yachtName}
                          className="w-24 h-24 object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=200';
                          }}
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {yachtName}
                        </h3>
                        {yachtDescription && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {yachtDescription}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      {yacht.capacity && (
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span>{yacht.capacity} {t('أشخاص', 'people')}</span>
                        </div>
                      )}
                      
                      {yacht.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>{yacht.location}</span>
                        </div>
                      )}

                      <div className="flex flex-col gap-1 pt-2">
                        <p className="text-lg font-bold text-primary">
                          ${Number(pricePerDay).toFixed(0)} / {t('يوم', 'day')}
                        </p>
                        {pricePerHour && (
                          <p className="text-sm text-muted-foreground">
                            ${Number(pricePerHour).toFixed(0)} / {t('ساعة', 'hour')}
                          </p>
                        )}
                      </div>

                      {activePromo && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                          {activePromo.discount_percentage}% {t('خصم', 'OFF')}
                        </Badge>
                      )}

                      {yacht.features && yacht.features.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {yacht.features.slice(0, 3).map((feature: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {item.startDate && item.endDate && (
                        <div className="pt-2 border-t">
                          <p className="text-xs text-muted-foreground">
                            {t('التواريخ المحددة:', 'Selected dates:')}
                          </p>
                          <p className="text-sm font-medium">
                            {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={() => setSelectedYacht(yacht)}
                      >
                        <Calendar className="w-4 h-4 ml-1" />
                        {t('احجز الآن', 'Book Now')}
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => removeFromCart(yacht.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </SheetContent>
      </Sheet>

      {selectedYacht && (
        <BookingModal
          yacht={selectedYacht}
          open={!!selectedYacht}
          onClose={() => setSelectedYacht(null)}
        />
      )}
    </>
  );
};
