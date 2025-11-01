import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Phone } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import asfarLogo from '@/assets/logo1.png';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { settingsService } from '@/lib/storage';

export const Navigation = (_props: {}) => {
  const { language, toggleLanguage, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    const loadPhone = async () => {
      try {
        const num = await settingsService.getWhatsAppNumber();
        setPhoneNumber(num || '');
      } catch (e) {
        console.error('Failed to load phone number', e);
      }
    };
    loadPhone();
  }, []);

  const handleScroll = (id: string) => {
    if (location.pathname !== '/') {
      navigate('/', { replace: false });
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const element = document.getElementById(id);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
    setOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary backdrop-blur-sm border-b border-primary-foreground/20">
      <div className="flex items-center h-16 md:h-20 px-3 md:px-4">
        <div className="flex items-center gap-2 md:gap-3 ml-0 pl-0 cursor-pointer shrink-0 md:basis-1/3 basis-1/2">
          <div className="hidden md:flex items-center" onClick={() => handleScroll('home')}>
            <img
              src={asfarLogo}
              alt="Asfar Logo"
              className="h-24 lg:h-28 w-auto object-contain transition-transform duration-300 ease-out"
            />
            <span className="ml-2 text-2xl lg:text-3xl font-['Playfair_Display'] tracking-wide text-primary-foreground transition-colors">
              Asfar
            </span>
          </div>
          {phoneNumber && (
            <a
              href={`tel:${phoneNumber}`}
              className="md:hidden flex items-center gap-2 text-primary-foreground/90 text-base font-semibold tracking-wide transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Phone className="w-4 h-4 transition-transform duration-300 ease-out" />
              <span className="transition-colors duration-300 ease-out">{phoneNumber}</span>
            </a>
          )}
        </div>

        <div className="hidden md:flex flex-1 items-center justify-center gap-6 pr-6 transition-all duration-300 ease-in-out">
          <button
            onClick={() => handleScroll('home')}
            className="text-primary-foreground hover:text-primary-foreground/80 hover:underline underline-offset-8 decoration-2 font-medium transition-colors"
          >
            {t('الرئيسية', 'Home')}
          </button>
          <button
            onClick={() => navigate('/fleet')}
            className="text-primary-foreground hover:text-primary-foreground/80 hover:underline underline-offset-8 decoration-2 font-medium transition-colors"
          >
            {t('اليخوت', 'Fleet')}
          </button>
          <button
            onClick={() => navigate('/water-sports')}
            className="text-primary-foreground hover:text-primary-foreground/80 hover:underline underline-offset-8 decoration-2 font-medium transition-colors"
          >
            Water Sports
          </button>
          <button
            onClick={() => navigate('/food')}
            className="text-primary-foreground hover:text-primary-foreground/80 hover:underline underline-offset-8 decoration-2 font-medium transition-colors"
          >
            Food
          </button>
          <button
            onClick={() => navigate('/additional-services')}
            className="text-primary-foreground hover:text-primary-foreground/80 hover:underline underline-offset-8 decoration-2 font-medium transition-colors"
          >
            {t('خدمات إضافية', 'Additional Services')}
          </button>
          <button
            onClick={() => navigate('/bookings-calendar')}
            className="text-primary-foreground hover:text-primary-foreground/80 hover:underline underline-offset-8 decoration-2 font-medium transition-colors"
          >
            {t('حجوزاتي', 'My Bookings')}
          </button>
          <button
            onClick={() => handleScroll('contact')}
            className="text-primary-foreground hover:text-primary-foreground/80 hover:underline underline-offset-8 decoration-2 font-medium transition-colors"
          >
            {t('اتصل بنا', 'Contact Us')}
          </button>

          {/* Select لتغيير اللغة */}
          <Select
            value={language.code}
            onValueChange={(val) => {
              if (val !== language.code) toggleLanguage();
            }}
          >
            <SelectTrigger className="w-[140px] bg-primary text-primary-foreground border border-primary-foreground/50">
              <SelectValue placeholder={t('اختر اللغة', 'Select language')} />
            </SelectTrigger>
            <SelectContent className="bg-primary text-primary-foreground border border-primary-foreground/50">
              <SelectItem value="ar">{t('العربية', 'Arabic')}</SelectItem>
              <SelectItem value="en">{t('الإنجليزية', 'English')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="flex md:hidden items-center gap-2 pr-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(!open)}
              className="hover:bg-primary-foreground/20 text-primary-foreground"
              aria-label={open ? 'Close Menu' : 'Open Menu'}
            >
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden px-4 pb-4 animate-slide-down">
          <div className="flex flex-col gap-3 bg-primary/80 rounded-xl p-4 border border-primary-foreground/20">
            <button
              onClick={() => handleScroll('home')}
              className="text-primary-foreground text-left font-medium hover:text-primary-foreground/80 hover:underline underline-offset-8 decoration-2"
            >
              {t('الرئيسية', 'Home')}
            </button>
            <button
              onClick={() => navigate('/fleet')}
              className="text-primary-foreground text-left font-medium hover:text-primary-foreground/80 hover:underline underline-offset-8 decoration-2"
            >
              {t('اليخوت', 'Fleet')}
            </button>
            <button
              onClick={() => navigate('/water-sports')}
              className="text-primary-foreground text-left font-medium hover:text-primary-foreground/80 hover:underline underline-offset-8 decoration-2"
            >
              Water Sports
            </button>
            <button
              onClick={() => navigate('/food')}
              className="text-primary-foreground text-left font-medium hover:text-primary-foreground/80 hover:underline underline-offset-8 decoration-2"
            >
              Food
            </button>
            <button
              onClick={() => navigate('/additional-services')}
              className="text-primary-foreground text-left font-medium hover:text-primary-foreground/80 hover:underline underline-offset-8 decoration-2"
            >
              {t('خدمات إضافية', 'Additional Services')}
            </button>
            <button
              onClick={() => handleScroll('contact')}
              className="text-primary-foreground text-left font-medium hover:text-primary-foreground/80 hover:underline underline-offset-8 decoration-2"
            >
              {t('اتصل بنا', 'Contact')}
            </button>

            {/* Select لغة للموبايل */}
            <Select
              value={language.code}
              onValueChange={(val) => {
                if (val !== language.code) toggleLanguage();
              }}
            >
              <SelectTrigger className="mt-2 w-full bg-primary text-primary-foreground border border-primary-foreground/50">
                <SelectValue placeholder={t('اختر اللغة', 'Select language')} />
              </SelectTrigger>
              <SelectContent className="bg-primary text-primary-foreground border border-primary-foreground/50">
                <SelectItem value="ar">{t('العربية', 'Arabic')}</SelectItem>
                <SelectItem value="en">{t('الإنجليزية', 'English')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </nav>
  );
};
