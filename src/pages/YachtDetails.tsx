import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { BookingModal } from '@/components/BookingModal';
import { Yacht, Promotion, YachtOption } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { promotionService, settingsService, yachtService } from '@/lib/storage';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, MapPin, Users, Ruler, Check } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';

const YachtDetails = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  const [yacht, setYacht] = useState<Yacht | null>(null);
  const [images, setImages] = useState<Array<{ id: string; image_url: string }>>([]);
  const [options, setOptions] = useState<YachtOption[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const activePromotion = useMemo(() => {
    const now = new Date();
    return promotions.find(
      (p) => p.is_active && (!p.yacht_id || p.yacht_id === yacht?.id) && (!p.valid_from || new Date(p.valid_from) <= now) && (!p.valid_until || new Date(p.valid_until) >= now)
    );
  }, [promotions, yacht?.id]);

  const freeOptions = useMemo(() => options.filter((o) => !o.price || o.price === 0), [options]);
  const paidOptions = useMemo(() => options.filter((o) => o.price && o.price > 0), [options]);

  useEffect(() => {
    const loadAll = async () => {
      try {
        if (!id) return;
        setLoading(true);
        const [yachtData, promData] = await Promise.all([
          yachtService.getYachtById(id),
          promotionService.getPromotions(),
        ]);
        setYacht(yachtData || null);
        setPromotions(promData || []);

        const [{ data: imgs }, { data: opts }] = await Promise.all([
          supabase.from('yacht_images').select('id,image_url').eq('yacht_id', id).order('display_order'),
          supabase.from('yacht_options').select('*').eq('yacht_id', id).eq('is_active', true).order('display_order'),
        ]);
        setImages(imgs || []);
        setOptions(opts as YachtOption[] || []);
      } catch (e) {
        console.error('Failed to load yacht details', e);
        toast.error(t('فشل تحميل تفاصيل اليخت', 'Failed to load yacht details'));
      } finally {
        setLoading(false);
      }
    };

    loadAll();

    const yachtsChannel = supabase
      .channel('yacht-details-yachts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'yachts', filter: `id=eq.${id}` }, () => loadAll())
      .subscribe();
    const imagesChannel = supabase
      .channel('yacht-details-images')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'yacht_images', filter: `yacht_id=eq.${id}` }, () => loadAll())
      .subscribe();
    const optionsChannel = supabase
      .channel('yacht-details-options')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'yacht_options', filter: `yacht_id=eq.${id}` }, () => loadAll())
      .subscribe();
    const promosChannel = supabase
      .channel('yacht-details-promotions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'promotions' }, () => loadAll())
      .subscribe();

    return () => {
      supabase.removeChannel(yachtsChannel);
      supabase.removeChannel(imagesChannel);
      supabase.removeChannel(optionsChannel);
      supabase.removeChannel(promosChannel);
    };
  }, [id, t]);

  useEffect(() => {
    const loadWhatsApp = async () => {
      try {
        const number = await settingsService.getWhatsAppNumber();
        setWhatsappNumber(number);
      } catch (e) {
        console.error('Failed to load WhatsApp number', e);
      }
    };
    loadWhatsApp();
  }, []);

  useEffect(() => {
    if (!carouselApi) return;
    setSelectedIndex(carouselApi.selectedScrollSnap());
    const onSelect = () => setSelectedIndex(carouselApi.selectedScrollSnap());
    carouselApi.on('select', onSelect);
    return () => {
      carouselApi.off('select', onSelect);
    };
  }, [carouselApi]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-xl">{t('جاري التحميل...', 'Loading...')}</div>
      </div>
    );
  }

  if (!yacht) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-2xl font-bold mb-4">{t('اليخت غير موجود', 'Yacht not found')}</h1>
          <Button asChild>
            <Link to="/">{t('العودة إلى الرئيسية', 'Back to Home')}</Link>
          </Button>
        </div>
      </div>
    );
  }

  const whatsappMessage = encodeURIComponent(`${t('مرحباً، أرغب بحجز هذا اليخت:', 'Hello, I would like to book this yacht:')} ${yacht.name}`);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="container mx-auto px-4 pt-24 pb-10">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" asChild>
            <Link to="/">← {t('العودة', 'Back')}</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 order-1 lg:order-1">
            <Card className="overflow-hidden">
              {images.length > 0 ? (
                <div className="relative">
                  <Carousel className="w-full" setApi={setCarouselApi}>
                    <CarouselContent>
                      {images.map((img) => (
                        <CarouselItem key={img.id}>
                          <img src={img.image_url} alt={yacht.name} className="w-full h-[380px] md:h-[480px] object-cover" />
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    {images.length > 1 && (
                      <>
                        <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2" />
                        <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2" />
                      </>
                    )}
                  </Carousel>
                  {images.length > 1 && (
                    <div className="mt-3 grid gap-2 [grid-template-columns:repeat(auto-fill,minmax(110px,1fr))]">
                      {images.map((img, idx) => (
                        <button
                          key={img.id}
                          type="button"
                          onClick={() => carouselApi?.scrollTo(idx)}
                          className={`relative w-full aspect-[4/3] rounded overflow-hidden border ${
                            selectedIndex === idx ? 'ring-2 ring-primary border-primary' : 'border-border'
                          }`}
                          aria-label={`Thumbnail ${idx + 1}`}
                        >
                          <img src={img.image_url} alt={`${yacht.name} thumbnail ${idx + 1}`} className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <img src={yacht.main_image || '/placeholder.svg'} alt={yacht.name} className="w-full h-[380px] md:h-[480px] object-cover" />
              )}
            </Card>
          </div>

          <div className="lg:col-span-1 order-2 lg:order-2">
            <Card className="p-6 lg:sticky lg:top-24 space-y-4">
              <div className="border-t" />

              <div>
                <h3 className="text-lg font-semibold mb-3">{t('الميزات الرئيسية', 'Key Features')}</h3>
                <ul className="space-y-2 text-sm">
                  {yacht.capacity ? (
                    <li className="flex items-center gap-2"><Users className="w-4 h-4 text-primary" /><span>{t('الحد الأقصى للضيوف', 'Maximum Capacity')}: {yacht.capacity}</span></li>
                  ) : null}
                  {yacht.length ? (
                    <li className="flex items-center gap-2"><Ruler className="w-4 h-4 text-primary" /><span>{t('الطول', 'Size')}: {yacht.length} ft</span></li>
                  ) : null}
                  {yacht.location ? (
                    <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /><span>{t('الموقع', 'Location')}: {yacht.location}</span></li>
                  ) : null}
                  {typeof yacht.price_per_day === 'number' ? (
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /><span>{t('السعر/اليوم', 'Price/Day')}: AED {Number(yacht.price_per_day).toFixed(0)}</span></li>
                  ) : null}
                  {yacht.features && yacht.features.length > 0
                    ? yacht.features.slice(0, 6).map((f, idx) => (
                        <li key={idx} className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /><span>{f}</span></li>
                      ))
                    : null}
                </ul>
                {paidOptions.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-3">{t('الخيارات الإضافية', 'Add-ons')}</h3>
                    <div className="flex flex-wrap gap-2">
                      {paidOptions.map((opt) => (
                        <Badge key={opt.id} variant="outline" className="text-xs">
                          {opt.name} · {opt.price} AED
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Desktop-only price box directly under Key Features */}
                <div className="mt-4 p-4 border rounded-lg hidden lg:block">
                  <div className="flex items-center justify-between">
                    <div className="text-base font-semibold">{yacht.name}</div>
                    <div className="text-emerald-700 font-semibold">AED {Number(yacht.price_per_hour || 0).toFixed(0)}/Hr</div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" onClick={() => setIsModalOpen(true)}>
                      {t('احصل على أفضل سعر', 'Get Best Price')}
                    </Button>
                    {whatsappNumber && (
                      <Button asChild size="sm" variant="outline">
                        <a href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`} target="_blank" rel="noopener noreferrer">
                          {t('واتساب', 'WhatsApp')}
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t" />

              {(
                freeOptions.length > 0
              ) && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">{t('المتضمنات المجانية', 'Complimentary Inclusions')}</h3>
                  <ul className="space-y-2 text-sm">
                    {freeOptions.map((opt) => (
                      <li key={opt.id} className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /><span>{opt.name}</span></li>
                    ))}
                  </ul>
                </div>
              )}

              

              {activePromotion && (
                <div className="border-t" />
              )}

              {activePromotion && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800">
                  <div className="font-semibold">
                    {activePromotion.discount_percentage}% {t('خصم', 'OFF')}
                  </div>
                  {activePromotion.description && (
                    <div className="text-sm">{activePromotion.description}</div>
                  )}
                </div>
              )}
            </Card>
          </div>

          <div className="lg:col-span-2 order-3 lg:order-3">
            <Card className="p-6">
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line break-words overflow-hidden">{t(yacht.description_ar || yacht.description, yacht.description)}</p>
            </Card>
          </div>

          <div className="order-4 lg:order-3 lg:col-span-1 lg:col-start-3 block lg:hidden">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div className="text-base font-semibold">{yacht.name}</div>
                <div className="text-emerald-700 font-semibold">AED {Number(yacht.price_per_hour || 0).toFixed(0)}/Hr</div>
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" onClick={() => setIsModalOpen(true)}>
                  {t('احصل على أفضل سعر', 'Get Best Price')}
                </Button>
                {whatsappNumber && (
                  <Button asChild size="sm" variant="outline">
                    <a href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`} target="_blank" rel="noopener noreferrer">
                      {t('واتساب', 'WhatsApp')}
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <BookingModal yacht={yacht} open={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default YachtDetails;
