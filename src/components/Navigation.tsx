import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import asfarLogo from '@/assets/asfar-logo.png';

export const Navigation = () => {
  const { toggleLanguage, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

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
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary backdrop-blur-sm border-b border-primary-foreground/20">
      <div className="flex items-center justify-between h-20 px-4">
        
        {/* Logo + Asfar */}
        <div className="flex items-center gap-3 ml-0 pl-0 cursor-pointer" onClick={() => handleScroll('home')}>
          <img 
            src={asfarLogo} 
            alt="Asfar Logo" 
            className="w-28 h-28 pt-2 group-hover:scale-110 transition-transform"
          />
          <span className="text-3xl font-bold text-primary-foreground font-['Playfair_Display']">Asfar</span>
        </div>

        {/* روابط القائمة */}
        <div className="flex items-center gap-6 pr-6">
          <button
            onClick={() => handleScroll('home')}
            className="text-primary-foreground hover:text-primary-foreground/80 font-medium transition-colors"
          >
            {t('الرئيسية', 'Home')}
          </button>
          <button
            onClick={() => handleScroll('yachts')}
            className="text-primary-foreground hover:text-primary-foreground/80 font-medium transition-colors"
          >
            {t('اليخوت', 'Fleet')}
          </button>
          <button
            onClick={() => handleScroll('contact')}
            className="text-primary-foreground hover:text-primary-foreground/80 font-medium transition-colors"
          >
            {t('اتصل بنا', 'Contact')}
          </button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleLanguage}
            className="hover:bg-primary-foreground/20 text-primary-foreground"
          >
            <Globe className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
};
