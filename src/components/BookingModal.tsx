import { useState, useEffect } from 'react';
import { Yacht, Booking, YachtOption } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { bookingService, settingsService } from '@/lib/storage';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CalendarDays, CreditCard, User, MessageCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { z } from 'zod';

interface BookingModalProps {
  yacht: Yacht;
  open: boolean;
  onClose: () => void;
  selectedExtras?: {
    waterSports?: Array<{ name: string; duration: '30' | '60'; price?: number }>;
    food?: Array<{ name: string; quantity: number; pricePerPerson?: number }>;
    additionalServices?: Array<{ name: string; price?: number }>;
  };
}

// Zod validation schema for booking form inputs
const bookingSchema = z.object({
  customerName: z.string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\u0600-\u06FF\s'-]+$/, 'Name contains invalid characters'),
  customerEmail: z.string()
    .trim()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters'),
  customerPhone: z.string()
    .trim()
    .regex(/^\+?[0-9\s()-]{8,20}$/, 'Invalid phone number format')
    .min(8, 'Phone number too short')
    .max(20, 'Phone number too long'),
  hours: z.number()
    .int('Hours must be a whole number')
    .min(1, 'Minimum 1 hour')
    .max(72, 'Maximum 72 hours')
});

export const BookingModal = ({ yacht, open, onClose, selectedExtras }: BookingModalProps) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [step, setStep] = useState<'details' | 'payment'>('details');
  const [hours, setHours] = useState<number>(1);
  const [isAvailable, setIsAvailable] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [availableOptions, setAvailableOptions] = useState<YachtOption[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  // Tracks whether the user tried to go to the next step.
  // We only show red inline errors after this becomes true.
  const [attemptedNext, setAttemptedNext] = useState(false);

  useEffect(() => {
    if (open) {
      checkAvailability();
      loadWhatsAppNumber();
      loadYachtOptions();
    }
  }, [open, yacht.id]);

  const loadWhatsAppNumber = async () => {
    try {
      const number = await settingsService.getWhatsAppNumber();
      setWhatsappNumber(number);
    } catch (error) {
      console.error('Error loading WhatsApp number:', error);
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
      
      setAvailableOptions(data || []);
    } catch (error) {
      console.error('Error loading yacht options:', error);
    }
  };

  const checkAvailability = async () => {
    try {
      const { data } = await supabase
        .from('yachts')
        .select('is_available')
        .eq('id', yacht.id)
        .single();
      
      setIsAvailable(data?.is_available ?? true);
    } catch (error) {
      console.error('Error checking availability:', error);
    }
  };

  const optionsTotal = selectedOptions.reduce((sum, optionId) => {
    const option = availableOptions.find(o => o.id === optionId);
    return sum + (option?.price || 0);
  }, 0);

  const totalPrice = (hours * yacht.price_per_hour) + optionsTotal;

  const generateWhatsAppMessage = () => {
    const price = totalPrice.toFixed(2);
    const selectedOptionsText = selectedOptions.map(id => {
      const option = availableOptions.find(o => o.id === id);
      return option ? `  • ${option.name}: ${option.price} AED` : '';
    }).filter(Boolean).join('\n');
    const extraLines: string[] = [];
    if (selectedExtras) {
      if (selectedExtras.waterSports && selectedExtras.waterSports.length > 0) {
        extraLines.push('Water Sports:');
        selectedExtras.waterSports.forEach(ws => {
          extraLines.push(`  • ${ws.name} - ${ws.duration === '30' ? '30 min' : '1 hour'}${typeof ws.price === 'number' ? `: ${ws.price} AED` : ''}`);
        });
      }
      if (selectedExtras.food && selectedExtras.food.length > 0) {
        extraLines.push('Food:');
        selectedExtras.food.forEach(f => {
          extraLines.push(`  • ${f.name} x ${f.quantity}${typeof f.pricePerPerson === 'number' ? `: ${f.pricePerPerson} AED/person` : ''}`);
        });
      }
      if (selectedExtras.additionalServices && selectedExtras.additionalServices.length > 0) {
        extraLines.push('Additional Services:');
        selectedExtras.additionalServices.forEach(s => {
          extraLines.push(`  • ${s.name}${typeof s.price === 'number' ? `: ${s.price} AED` : ''}`);
        });
      }
    }
    
    const message = encodeURIComponent(
      `Hello! I want to book the yacht "${yacht.name}"\n\n` +
      `Customer: ${customerName}\n` +
      `Email: ${customerEmail}\n` +
      `Phone: ${customerPhone}\n\n` +
      `Rental Details:\n` +
      `- Duration: ${hours} ${t('ساعات', 'hours')}\n` +
      `- Hourly Rate: ${yacht.price_per_hour} AED\n` +
      (selectedOptionsText ? `\nSelected Options:\n${selectedOptionsText}\n` : '') +
      (extraLines.length > 0 ? `\nSelected Extras:\n${extraLines.join('\n')}\n` : '') +
      `- Total Price: ${price} AED\n` +
      `- Location: ${yacht.location || 'Not specified'}\n\n` +
      `Please confirm availability and payment details.`
    );
    
    return `https://wa.me/${whatsappNumber}?text=${message}`;
  };

  const handleWhatsAppBooking = () => {
    // Validate inputs using zod schema
    try {
      bookingSchema.parse({
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        hours
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach(err => {
          toast.error(err.message);
        });
      }
      return;
    }

    const whatsappUrl = generateWhatsAppMessage();
    window.open(whatsappUrl, '_blank');
    toast.success(t('سيتم فتح واتساب...', 'Opening WhatsApp...'));
  };

  const handleBooking = async () => {
    // Validate inputs using zod schema
    let validatedData;
    try {
      validatedData = bookingSchema.parse({
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        hours
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach(err => {
          toast.error(err.message);
        });
      }
      return;
    }

    try {
      const now = new Date();
      const booking = {
        yacht_id: yacht.id,
        customer_name: validatedData.customerName,
        customer_email: validatedData.customerEmail,
        customer_phone: validatedData.customerPhone,
        start_date: now.toISOString(),
        end_date: new Date(now.getTime() + validatedData.hours * 60 * 60 * 1000).toISOString(),
        total_price: totalPrice,
        booking_source: 'direct' as const,
        duration_type: 'hourly' as const,
        duration_value: validatedData.hours,
      };

      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          ...booking,
          user_id: user?.id || '00000000-0000-0000-0000-000000000000'
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Insert selected options
      if (selectedOptions.length > 0 && bookingData) {
        const bookingOptions = selectedOptions.map(optionId => {
          const option = availableOptions.find(o => o.id === optionId);
          return {
            booking_id: bookingData.id,
            option_id: optionId,
            option_name: option?.name || '',
            option_price: option?.price || 0,
          };
        });

        const { error: optionsError } = await supabase
          .from('booking_options')
          .insert(bookingOptions);

        if (optionsError) throw optionsError;
      }
      
      toast.success(t('تم الحجز بنجاح! سيتم مراجعة حجزك قريباً', 'Booking submitted successfully! Your booking will be reviewed soon'));
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error(t('حدث خطأ في الحجز', 'Error creating booking'));
    }
  };

  const resetForm = () => {
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('');
    setStep('details');
    setHours(1);
    setSelectedOptions([]);
  };

  const toggleOption = (optionId: string) => {
    setSelectedOptions(prev =>
      prev.includes(optionId)
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    );
  };

  if (!isAvailable) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-destructive">
              {t('غير متاح', 'Not Available')}
            </DialogTitle>
          </DialogHeader>
          <div className="py-6 text-center">
            <p className="text-muted-foreground mb-4">
              {t('عذراً، هذا اليخت غير متاح حالياً للحجز', 'Sorry, this yacht is currently not available for booking')}
            </p>
            <Button onClick={onClose} className="w-full">
              {t('إغلاق', 'Close')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">
            {t('حجز يخت', 'Book Yacht')} - {yacht.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Guest Booking Notice */}
          {!user && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <User className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">
                  {t('حجز كضيف', 'Guest Booking')}
                </p>
                <p className="text-blue-700">
                  {t('لا يلزم التسجيل. فقط قم بملء معلوماتك وسنتواصل معك قريباً', 
                     'No registration required. Just fill in your details and we\'ll contact you soon')}
                </p>
              </div>
            </div>
          )}

          {/* Step Indicators */}
          <div className="flex items-center justify-center gap-4 pb-4">
            <div className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
              step === 'details' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
              <User className="w-4 h-4" />
              <span>{t('المعلومات', 'Details')}</span>
            </div>
            <div className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
              step === 'payment' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
              <CreditCard className="w-4 h-4" />
              <span>{t('التأكيد', 'Confirm')}</span>
            </div>
          </div>

          {/* Rental Information */}
          <div className="bg-gradient-ocean p-4 rounded-lg text-white text-center">
            <p className="text-sm opacity-90">{t('سعر الساعة', 'Hourly Rate')}</p>
            <p className="text-3xl font-bold mt-1">{yacht.price_per_hour} {t('درهم', 'AED')}/{t('ساعة', 'hour')}</p>
          </div>

          {/* Details Step */}
          {step === 'details' && (
            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {t('عدد الساعات', 'Number of Hours')}
                </Label>
               <Input
  type="number"
  min="1"
  required
  value={hours === 0 ? '' : hours} // إذا كانت القيمة 0، خليها فراغ
  onChange={(e) => {
    const val = parseInt(e.target.value);
    setHours(isNaN(val) ? 0 : val); // لو المستخدم مسح كل شيء، خليها 0
  }}
  placeholder={t('أدخل عدد الساعات', 'Enter number of hours')}
  className={cn(
    "text-lg",
    attemptedNext && (!hours || hours < 1) && "border-red-500 focus-visible:ring-red-500"
  )}
/>

                {attemptedNext && (!hours || hours < 1) && (
                  <p className="mt-1 text-sm text-red-600">{t('هذا الحقل مطلوب', 'This field is required.')}</p>
                )}
              </div>

              {availableOptions.length > 0 && (
                <div>
                  <Label className="text-base font-semibold mb-3 block">
                    {t('خيارات إضافية', 'Additional Options')}
                  </Label>
                  <div className="space-y-2">
                    {availableOptions.map((option) => (
                      <div
                        key={option.id}
                        className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                        onClick={() => toggleOption(option.id)}
                      >
                        <Checkbox
                          checked={selectedOptions.includes(option.id)}
                          onCheckedChange={() => toggleOption(option.id)}
                        />
                        <div className="flex-1">
                          <p className="font-medium">{option.name}</p>
                          {option.description && (
                            <p className="text-sm text-muted-foreground">{option.description}</p>
                          )}
                          <p className="text-sm font-semibold text-primary mt-1">
                            +{option.price} {t('درهم', 'AED')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>{t('عدد الساعات:', 'Hours:')}</span>
                  <span className="font-semibold">{hours}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('سعر الإيجار:', 'Rental Price:')}</span>
                  <span className="font-semibold">{(hours * yacht.price_per_hour).toFixed(2)} {t('درهم', 'AED')}</span>
                </div>
                {optionsTotal > 0 && (
                  <div className="flex justify-between">
                    <span>{t('الخيارات الإضافية:', 'Additional Options:')}</span>
                    <span className="font-semibold">{optionsTotal.toFixed(2)} {t('درهم', 'AED')}</span>
                  </div>
                )}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-bold">{t('المجموع:', 'Total:')}</span>
                    <span className="text-2xl font-bold text-secondary">{totalPrice.toFixed(2)} {t('درهم', 'AED')}</span>
                  </div>
                </div>
              </div>

              <div>
                <Label>{t('الاسم الكامل', 'Full Name')}</Label>
                <Input
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={t('أدخل اسمك', 'Enter your name')}
                  className={cn(
                    attemptedNext && !customerName && "border-red-500 focus-visible:ring-red-500"
                  )}
                />
                {attemptedNext && !customerName && (
                  <p className="mt-1 text-sm text-red-600">{t('هذا الحقل مطلوب', 'This field is required.')}</p>
                )}
              </div>
              <div>
                <Label>{t('البريد الإلكتروني', 'Email')}</Label>
                <Input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder={t('أدخل بريدك الإلكتروني', 'Enter your email')}
                  className={cn(
                    attemptedNext && !customerEmail && "border-red-500 focus-visible:ring-red-500"
                  )}
                />
                {attemptedNext && !customerEmail && (
                  <p className="mt-1 text-sm text-red-600">{t('هذا الحقل مطلوب', 'This field is required.')}</p>
                )}
              </div>
              <div>
                <Label>{t('رقم الهاتف', 'Phone Number')}</Label>
                <Input
                  required
                  inputMode="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder={t('أدخل رقم هاتفك', 'Enter your phone')}
                  className={cn(
                    attemptedNext && !customerPhone && "border-red-500 focus-visible:ring-red-500"
                  )}
                />
                {attemptedNext && !customerPhone && (
                  <p className="mt-1 text-sm text-red-600">{t('هذا الحقل مطلوب', 'This field is required.')}</p>
                )}
              </div>
              <Button 
                onClick={() => {
                  // Mark that the user attempted to go to the next step.
                  // This triggers inline error messages for empty required fields.
                  setAttemptedNext(true);
                  if (!customerName || !customerEmail || !customerPhone) {
                    toast.error(t('يرجى ملء جميع الحقول', 'Please fill all fields'));
                    return;
                  }
                  if (!hours || hours < 1) {
                    toast.error(t('يرجى إدخال عدد الساعات', 'Please enter number of hours'));
                    return;
                  }
                  // Clear attempted flag when moving forward (optional UX)
                  setAttemptedNext(false);
                  setStep('payment');
                }}
                className="w-full bg-gradient-ocean" 
                size="lg"
              >
                {t('التالي', 'Next')}
              </Button>
            </div>
          )}

          {/* Confirmation Step */}
          {step === 'payment' && (
            <div className="space-y-6">
              <div className="bg-gradient-ocean p-6 rounded-lg text-white text-center">
                <p className="text-sm opacity-90">{t('المبلغ الإجمالي', 'Total Amount')}</p>
                <p className="text-4xl font-bold mt-2">{totalPrice.toFixed(2)} {t('درهم', 'AED')}</p>
                <p className="text-xs opacity-75 mt-2">
                  {t('للساعات', 'for')} {hours} {t('ساعات', 'hours')}
                  {selectedOptions.length > 0 && ` + ${selectedOptions.length} ${t('خيارات', 'options')}`}
                </p>
              </div>

              <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                <h4 className="font-semibold mb-3">{t('ملخص الحجز', 'Booking Summary')}</h4>
                <div className="flex justify-between">
                  <span>{t('اليخت:', 'Yacht:')}</span>
                  <span className="font-medium">{yacht.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('المدة:', 'Duration:')}</span>
                  <span className="font-medium">{hours} {t('ساعات', 'hours')}</span>
                </div>
                {selectedOptions.length > 0 && (
                  <div className="border-t pt-2 mt-2">
                    <p className="font-medium mb-1">{t('الخيارات المختارة:', 'Selected Options:')}</p>
                    {selectedOptions.map(id => {
                      const option = availableOptions.find(o => o.id === id);
                      return option ? (
                        <div key={id} className="flex justify-between text-xs ml-2">
                          <span>• {option.name}</span>
                          <span>{option.price} {t('درهم', 'AED')}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
                {selectedExtras && (
                  <div className="border-t pt-2 mt-2 space-y-2">
                    {(selectedExtras.waterSports && selectedExtras.waterSports.length > 0) && (
                      <div>
                        <p className="font-medium mb-1">{t('الرياضات البحرية:', 'Water Sports:')}</p>
                        {selectedExtras.waterSports.map((ws, idx) => (
                          <div key={`ws-${idx}`} className="flex justify-between text-xs ml-2">
                            <span>• {ws.name} — {ws.duration === '30' ? t('30 دقيقة', '30 min') : t('ساعة واحدة', '1 hour')}</span>
                            {typeof ws.price === 'number' && (
                              <span>{ws.price} {t('درهم', 'AED')}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {(selectedExtras.food && selectedExtras.food.length > 0) && (
                      <div>
                        <p className="font-medium mb-1">{t('الطعام:', 'Food:')}</p>
                        {selectedExtras.food.map((f, idx) => (
                          <div key={`food-${idx}`} className="flex justify-between text-xs ml-2">
                            <span>• {f.name} × {f.quantity}</span>
                            {typeof f.pricePerPerson === 'number' && (
                              <span>{f.pricePerPerson} {t('درهم', 'AED')}/{t('شخص', 'person')}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {(selectedExtras.additionalServices && selectedExtras.additionalServices.length > 0) && (
                      <div>
                        <p className="font-medium mb-1">{t('خدمات إضافية:', 'Additional Services:')}</p>
                        {selectedExtras.additionalServices.map((s, idx) => (
                          <div key={`add-${idx}`} className="flex justify-between text-xs ml-2">
                            <span>• {s.name}</span>
                            {typeof s.price === 'number' && (
                              <span>{s.price} {t('درهم', 'AED')}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span>{t('الاسم:', 'Name:')}</span>
                  <span className="font-medium">{customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('البريد:', 'Email:')}</span>
                  <span className="font-medium">{customerEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('الهاتف:', 'Phone:')}</span>
                  <span className="font-medium" dir="ltr">{customerPhone}</span>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-900">
                <p className="font-semibold mb-1">{t('ملاحظة', 'Note')}</p>
                <p>
                  {t('سيتم مراجعة حجزك من قبل فريقنا وسنتواصل معك خلال 24 ساعة لتأكيد الحجز وتفاصيل الدفع',
                     'Your booking will be reviewed by our team and we will contact you within 24 hours to confirm the booking and payment details')}
                </p>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={handleWhatsAppBooking} 
                  variant="outline" 
                  className="w-full border-green-600 text-green-600 hover:bg-green-50"
                  size="lg"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  {t('احجز عبر واتساب', 'Book via WhatsApp')}
                </Button>
                <Button onClick={() => setStep('details')} variant="ghost" className="w-full" size="lg">
                  {t('رجوع', 'Back')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};