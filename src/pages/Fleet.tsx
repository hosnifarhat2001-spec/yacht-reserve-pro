import { useEffect, useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { YachtCard } from '@/components/YachtCard';
import { CartSheet } from '@/components/CartSheet';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { yachtService, promotionService } from '@/lib/storage';
import { Yacht, Promotion } from '@/types';

const Fleet = () => {
  const [yachts, setYachts] = useState<Yacht[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const loadData = async () => {
      try {
        const yachtsData = await yachtService.getYachts();
        const promotionsData = await promotionService.getPromotions();
        setYachts(yachtsData || []);
        setPromotions(promotionsData || []);
      } catch (error) {
        console.error('Error loading fleet:', error);
        toast.error(t('حدث خطأ في تحميل البيانات', 'Error loading data'));
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [t]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-xl">{t('جاري التحميل...', 'Loading...')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-4 right-4 z-50">
        <CartSheet />
      </div>
      <Navigation />

      <section className="container mx-auto px-4 py-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-primary">{t('أسطولنا الكامل', 'Our Full Fleet')}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('تصفح جميع يخوتنا المتاحة', 'Browse all available yachts')}
          </p>
        </div>

        {yachts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground">{t('لا توجد يخوت متاحة', 'No yachts available')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-fr">
            {yachts.map((yacht, index) => {
              const yachtPromo = promotions.find(
                (p) => p.is_active &&
                (!p.yacht_id || p.yacht_id === yacht.id) &&
                (!p.valid_from || new Date(p.valid_from) <= new Date()) &&
                (!p.valid_until || new Date(p.valid_until) >= new Date())
              );
              return (
                <div key={yacht.id} style={{ animationDelay: `${index * 100}ms` }} className="relative h-full">
                  {yachtPromo && (
                    <div className="absolute -top-2 -right-2 z-10 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                      {yachtPromo.discount_percentage}% {t('خصم', 'OFF')}
                    </div>
                  )}
                  <YachtCard yacht={yacht} />
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Fleet;
