import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { AdditionalService } from '@/types/services';
import { settingsService } from '@/lib/storage';
import { ShoppingCart } from 'lucide-react';

interface Props {
  service: AdditionalService;
}

export const AdditionalServiceCard = ({ service }: Props) => {
  const { t } = useLanguage();
  const [whatsappNumber, setWhatsappNumber] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      try {
        const number = await settingsService.getWhatsAppNumber();
        setWhatsappNumber(number);
      } catch (e) {
        console.error('Failed to load WhatsApp number', e);
      }
    };
    load();
  }, []);

  const handleWhatsApp = () => {
    if (!whatsappNumber) return;
    const message = encodeURIComponent(
      `Hello! I'd like to book an additional service.\n\n` +
      `Service: ${service.name}\n` +
      (service.description ? `Details: ${service.description}\n` : '') +
      `Price: ${service.price} AED\n\n` +
      `Please advise availability and next steps.`
    );
    const url = `https://wa.me/${whatsappNumber}?text=${message}`;
    window.open(url, '_blank');
  };

  return (
    <Card className="overflow-hidden group hover:shadow-2xl transition-all duration-300 animate-fade-in h-full flex flex-col">
      <div className="relative overflow-hidden h-64">
        {service.image_url ? (
          <img
            src={service.image_url}
            alt={service.name}
            className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-64 bg-muted flex items-center justify-center text-muted-foreground">
            <ShoppingCart className="w-12 h-12" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
      </div>

      <div className="p-6 flex-1 flex flex-col items-center text-center">
        <h3 className="text-2xl font-semibold text-foreground/90 mb-2">{service.name}</h3>

        <div className="w-full border-t" />

        <div className="w-full py-4">
          {service.description && (
            <p className="text-sm text-muted-foreground">{service.description}</p>
          )}
        </div>

        <div className="w-full border-t" />

        <div className="mt-4 text-amber-600 font-extrabold text-2xl">
          {Number(service.price || 0).toFixed(0)}
          <span className="text-base font-semibold ml-1">{t('د.إ', 'AED')}</span>
        </div>

        <Button onClick={handleWhatsApp} className="mt-4 w-full px-4 rounded-md border border-foreground/30 bg-foreground/90 text-background hover:bg-foreground">
          {t('احجز الآن', 'Book now')}
        </Button>
      </div>
    </Card>
  );
};
