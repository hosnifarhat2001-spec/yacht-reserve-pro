import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Yacht, Promotion, YachtOption } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { Ship, Users, Ruler, Check } from 'lucide-react';
import { promotionService } from '@/lib/storage';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

export const YachtCard = ({ yacht }: { yacht: Yacht }) => {
  const { t, language } = useLanguage();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [yachtOptions, setYachtOptions] = useState<YachtOption[]>([]);
  const [yachtImages, setYachtImages] = useState<Array<{ id: string; image_url: string }>>([]);

  useEffect(() => {
    loadPromotions();
    loadYachtOptions();
    loadYachtImages();
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

  const loadYachtImages = async () => {
    try {
      const { data } = await supabase
        .from('yacht_images')
        .select('id, image_url')
        .eq('yacht_id', yacht.id)
        .order('display_order');
      
      setYachtImages(data || []);
    } catch (error) {
      console.error('Error loading yacht images:', error);
    }
  };

  const hasActivePromotion = promotions.length > 0;

  return (
    <>
      <Card className="overflow-hidden group hover:shadow-2xl transition-all duration-300 animate-fade-in h-full flex flex-col">
        <div className="relative overflow-hidden h-64">
          {yachtImages.length > 0 ? (
            <Carousel className="w-full h-full">
              <CarouselContent>
                {yachtImages.map((img) => (
                  <CarouselItem key={img.id}>
                    <img
                      src={img.image_url}
                      alt={yacht.name}
                      className="w-full h-64 object-cover"
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              {yachtImages.length > 1 && (
                <>
                  <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2" />
                  <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2" />
                </>
              )}
            </Carousel>
          ) : (
            <img
              src={yacht.main_image || '/placeholder.svg'}
              alt={yacht.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
        </div>

        <div className="p-6 flex-1 flex flex-col items-center text-center">
          <h3 className="text-2xl font-semibold text-foreground/90 mb-2">{yacht.name}</h3>

          <div className="w-full border-t" />

          <div className="w-full py-4 space-y-2">
            {yacht.length && (
              <div className="text-sm">
                <span className="text-muted-foreground">{t('الطول', 'Long')}:</span>
                <span className="font-semibold ml-1">{yacht.length} Ft</span>
              </div>
            )}
            <div className="text-sm">
              <span className="text-muted-foreground">{t('السعة', 'capacity')}:</span>
              <span className="font-semibold ml-1">{yacht.capacity} {t('أشخاص', 'Pax')}</span>
            </div>
          </div>

          <div className="w-full border-t" />

          <div className="mt-4 text-amber-600 font-extrabold text-2xl">
            {Number(yacht.price_per_hour || 0).toFixed(0)}
            <span className="text-base font-semibold ml-1">{t('د.إ', 'AED')}</span>
          </div>

          <Button asChild className="mt-4 px-8 rounded-md border border-foreground/30 bg-foreground/90 text-background hover:bg-foreground" size="lg">
            <Link to={`/yacht/${yacht.id}`}>{t('اقرأ المزيد', 'Read More')}</Link>
          </Button>
        </div>
      </Card>
    </>
  );
};
