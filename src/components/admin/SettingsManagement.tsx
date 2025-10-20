import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { settingsService } from '@/lib/storage';
import { toast } from 'sonner';
import { Phone, Save } from 'lucide-react';

export const SettingsManagement = () => {
  const { t } = useLanguage();
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const number = await settingsService.getWhatsAppNumber();
      setWhatsappNumber(number);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSave = async () => {
    if (!whatsappNumber.trim()) {
      toast.error(t('يرجى إدخال رقم الهاتف', 'Please enter phone number'));
      return;
    }

    setLoading(true);
    try {
      await settingsService.saveWhatsAppNumber(whatsappNumber);
      toast.success(t('تم حفظ الإعدادات بنجاح', 'Settings saved successfully'));
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(t('حدث خطأ في حفظ الإعدادات', 'Error saving settings'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            {t('إعدادات واتساب', 'WhatsApp Settings')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="whatsapp">
              {t('رقم واتساب للحجوزات', 'WhatsApp Number for Bookings')}
            </Label>
            <Input
              id="whatsapp"
              type="text"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="1234567890"
              className="mt-2"
            />
            <p className="text-sm text-muted-foreground mt-2">
              {t('أدخل رقم الهاتف بدون علامة + أو مسافات (مثال: 966501234567)', 
                 'Enter phone number without + or spaces (example: 966501234567)')}
            </p>
          </div>
          <Button onClick={handleSave} disabled={loading} className="w-full sm:w-auto">
            <Save className="w-4 h-4 mr-2" />
            {loading ? t('جاري الحفظ...', 'Saving...') : t('حفظ الإعدادات', 'Save Settings')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};