import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Users, Clock } from 'lucide-react';
import { WaterSport } from '@/types/services';
import { settingsService } from '@/lib/storage';

interface Props {
  activity: WaterSport;
}

export const WaterSportCard = ({ activity }: Props) => {
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
      `Hello! I'd like to book a water sport.\n\n` +
      `Activity: ${activity.name}\n` +
      `Pax: up to ${activity.pax}\n` +
      `Prices: 30 min = ${activity.price_30min} AED, 60 min = ${activity.price_60min} AED\n\n` +
      `Please advise availability and next steps.`
    );
    const url = `https://wa.me/${whatsappNumber}?text=${message}`;
    window.open(url, '_blank');
  };

  return (
    <Card className="overflow-hidden group hover:shadow-2xl transition-all duration-300 animate-fade-in h-full flex flex-col">
      <div className="relative overflow-hidden h-64">
        {activity.image_url ? (
          <img
            src={activity.image_url}
            alt={activity.name}
            className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-64 bg-muted" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
      </div>

      <div className="p-6 flex-1 flex flex-col items-center text-center">
        <h3 className="text-2xl font-semibold text-foreground/90 mb-2">{activity.name}</h3>

        <div className="w-full border-t" />

        <div className="w-full py-4 space-y-2">
          <div className="flex items-center justify-center gap-2 text-sm">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">{t('السعة', 'Capacity')}:</span>
            <span className="font-semibold">{activity.pax} {t('أشخاص', 'Pax')}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 bg-muted rounded-lg flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span>30 {t('دقيقة', 'min')}</span>
            </div>
            <div className="p-3 bg-muted rounded-lg flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span>60 {t('دقيقة', 'min')}</span>
            </div>
          </div>
        </div>

        <div className="w-full border-t" />

        <div className="mt-4 grid grid-cols-2 gap-3 w-full">
          <div className="text-amber-600 font-extrabold text-xl text-center">
            {Number(activity.price_30min || 0).toFixed(0)}
            <span className="text-base font-semibold ml-1">{t('د.إ', 'AED')}</span>
          </div>
          <div className="text-amber-600 font-extrabold text-xl text-center">
            {Number(activity.price_60min || 0).toFixed(0)}
            <span className="text-base font-semibold ml-1">{t('د.إ', 'AED')}</span>
          </div>
        </div>

        <div className="mt-4 w-full">
          <Button onClick={handleWhatsApp} className="w-full px-4 rounded-md border border-foreground/30 bg-foreground/90 text-background hover:bg-foreground">
            {t('احجز الآن', 'Book now')}
          </Button>
        </div>
      </div>
    </Card>
  );
};
