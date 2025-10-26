import { useEffect, useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { YachtCard } from '@/components/YachtCard';
import { Button } from '@/components/ui/button';
import { CartSheet } from '@/components/CartSheet';
import { useLanguage } from '@/contexts/LanguageContext';
import { Waves, Phone, Mail, MapPin } from 'lucide-react';
import WhatsAppIcon from '@/components/icons/WhatsAppIcon';
import heroImage from '@/assets/hero-yacht.jpg';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { yachtService, promotionService, settingsService } from '@/lib/storage';
import { Yacht, Promotion } from '@/types';

const Index = () => {
  const [yachts, setYachts] = useState<Yacht[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuredImages, setFeaturedImages] = useState<{ image_url: string; yacht_name: string; yacht_id: string }[]>([]);
  const { t } = useLanguage();

  // WhatsApp contact configuration (loaded from settings for consistency)
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const whatsappMessage = encodeURIComponent('Hello, I want to book a yacht.');

  useEffect(() => {
    loadData();
    loadFeaturedImages();
    
    // Set up real-time subscriptions for instant updates
    const yachtsChannel = supabase
      .channel('yachts-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'yachts' },
        (payload) => {
          console.log('Yacht change detected:', payload);
          loadData(); // Reload all data when yachts change
        }
      )
      .subscribe();

    const promotionsChannel = supabase
      .channel('promotions-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'promotions' },
        (payload) => {
          console.log('Promotion change detected:', payload);
          loadData(); // Reload all data when promotions change
        }
      )
      .subscribe();

    const imagesChannel = supabase
      .channel('yacht-images-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'yacht_images' },
        (payload) => {
          console.log('Yacht images change detected:', payload);
          loadFeaturedImages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(yachtsChannel);
      supabase.removeChannel(promotionsChannel);
      supabase.removeChannel(imagesChannel);
    };
  }, []);

  // Load WhatsApp number from site settings to keep it consistent with booking flow
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

  const loadData = async () => {
    try {
      // Use yachtService to get properly transformed data
      const yachtsData = await yachtService.getYachts();
      
      // Use promotionService to get properly transformed data
      const promotionsData = await promotionService.getPromotions();

      console.log('Loaded yachts:', yachtsData);
      setYachts(yachtsData || []);
      setPromotions(promotionsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error(t('حدث خطأ في تحميل البيانات', 'Error loading data'));
    } finally {
      setLoading(false);
    }
  };

  const loadFeaturedImages = async () => {
    try {
      const { data, error } = await supabase
        .from('yacht_images')
        .select('image_url, display_order, yachts(id, name)')
        .in('display_order', [1, 2, 3])
        .order('display_order', { ascending: true });

      if (error) throw error;

      const featured = data?.map(item => ({
        image_url: item.image_url,
        yacht_name: (item.yachts as any)?.name || '',
        yacht_id: (item.yachts as any)?.id || ''
      })) || [];

      setFeaturedImages(featured);
    } catch (error) {
      console.error('Error loading featured images:', error);
    }
  };

  // Removed search/filter: rendering all yachts directly

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

      {/* Floating WhatsApp Button */}

{whatsappNumber && (
  <div className="fixed bottom-5 right-5 z-50">
    <a
      href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Open WhatsApp chat"
      title="دردشة واتساب"
      className="group relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-800/30 transform transition-all duration-300 hover:scale-110"
    >
      <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-20 blur-sm animate-pulse" aria-hidden="true" />
      <span className="absolute -bottom-3 right-0 hidden sm:block group-hover:block transform translate-y-0 transition-all duration-200"></span>

      {/* WhatsApp icon */}
      <WhatsAppIcon className="w-7 h-7 text-white relative z-10" />
    </a>
  </div>
)}


      {/* Hero Section */}
      <section id="home" className="relative h-[600px] flex items-center justify-center overflow-hidden mt-20">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Luxury Yacht" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative z-10 text-center text-white px-4 animate-fade-in">
          <Waves className="w-16 h-16 mx-auto mb-6 animate-float" />
          <h1 className="text-5xl md:text-6xl font-bold mb-4">{t('تأجير اليخوت الفاخرة', 'Luxury Yacht Rentals')}</h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-2xl mx-auto">
            {t('استمتع بتجربة بحرية استثنائية على يخوتنا الفاخرة','Experience the ultimate luxury with our premium yacht fleet')}
          </p>
          <Button
            size="lg"
            className="bg-gradient-gold hover:opacity-90 text-foreground shadow-2xl text-lg px-8 py-6"
            onClick={() => {
              document.getElementById('yachts')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          >
            {t('استكشف اليخوت', 'Explore Fleet')}
          </Button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Featured Images Section */}
      {featuredImages.length > 0 && (
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-12 animate-slide-up">
            <h2 className="text-4xl font-bold mb-4 text-primary">{t('صور مميزة', 'Featured Gallery')}</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('استمتع بأفضل اللحظات من أسطولنا الفاخر', 'Experience the finest moments from our luxury fleet')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredImages.map((featured, index) => (
              <div 
                key={index} 
                className="relative group overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
                onClick={() => window.location.href = `/yacht/${featured.yacht_id}`}
              >
                <div className="aspect-[4/3] relative">
                  <img 
                    src={featured.image_url} 
                    alt={featured.yacht_name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <h3 className="text-2xl font-bold mb-2">{featured.yacht_name}</h3>
                    <p className="text-sm opacity-90">{t('اضغط للمشاهدة', 'Click to view')}</p>
                  </div>
                </div>
                <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-bold">
                  #{index + 1}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Yachts Section */}
      <section id="yachts" className="container mx-auto px-4 py-20">
        <div className="text-center mb-12 animate-slide-up">
          <h2 className="text-4xl font-bold mb-4 text-primary">{t('أسطولنا', 'Our Fleet')}</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t(
              'اختر من بين مجموعة متنوعة من اليخوت الفاخرة المجهزة بأحدث المرافق',
              'Choose from our curated collection of premium yachts equipped with world-class amenities'
            )}
          </p>
        </div>

        {/* Search & Filter removed */}

        {/* Yacht Cards */}
        {yachts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground">{t('لا توجد يخوت متاحة', 'No yachts available')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-fr">
            {yachts.map((yacht, index) => {
              // Find active promotion for this specific yacht or global promotions
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

      {/* Contact Section */}
      <section id="contact" className="bg-muted py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-primary">{t('تواصل معنا', 'Contact Us')}</h2>
            <p className="text-xl text-muted-foreground">{t('نحن هنا لمساعدتك في تنظيم رحلتك البحرية المثالية', 'We\'re here to help you plan your perfect voyage')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center p-6 bg-card rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center mb-4">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">{t('هاتف', 'Phone')}</h3>
              <p className="text-muted-foreground" dir="ltr">+966 50 123 4567</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-card rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">{t('بريد إلكتروني', 'Email')}</h3>
              <p className="text-muted-foreground">info@luxuryyachts.com</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-card rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">{t('موقع', 'Location')}</h3>
              <p className="text-muted-foreground text-center">{t('جدة، المملكة العربية السعودية', 'Jeddah, Saudi Arabia')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="opacity-90">{t('© 2025 تأجير اليخوت الفاخرة. جميع الحقوق محفوظة.', '© 2025 Luxury Yacht Rentals. All rights reserved.')}</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
