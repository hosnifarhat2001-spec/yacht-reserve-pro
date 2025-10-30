import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useLanguage } from '@/contexts/LanguageContext';
import { Yacht } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface BookingFormProps {
  yachts: Yacht[];
  onSuccess: () => void;
}

export const BookingForm = ({ yachts, onSuccess }: BookingFormProps) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const [formData, setFormData] = useState({
    title: '',
    first_name: '',
    last_name: '',
    customer_phone: '',
    address: '',
    customer_email: '',
    country: '',
    yacht_id: '',
    trip_start_time: '',
    trip_end_time: '',
    duration_value: '',
    number_of_persons: '',
    trip_type: '',
    rate_per_hour: '',
    apply_vat: true,
    other_charges: '0',
    discount: '0',
    coupon_code: '',
    supplier_yacht_payable: '0',
    supplier_extra_payable: '0',
    fine_penalty: '0',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startDate || !endDate) {
      toast.error(t('يرجى تحديد تاريخ البداية والنهاية', 'Please select start and end dates'));
      return;
    }

    setLoading(true);
    try {
      const totalPrice = calculateTotalPrice();
      
      const { error } = await supabase.from('bookings').insert({
        title: formData.title,
        first_name: formData.first_name,
        last_name: formData.last_name,
        customer_name: `${formData.first_name} ${formData.last_name}`,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        address: formData.address,
        country: formData.country,
        yacht_id: formData.yacht_id,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        trip_start_time: formData.trip_start_time,
        trip_end_time: formData.trip_end_time,
        duration_value: parseFloat(formData.duration_value) || 0,
        number_of_persons: parseInt(formData.number_of_persons) || 0,
        trip_type: formData.trip_type,
        rate_per_hour: parseFloat(formData.rate_per_hour) || 0,
        apply_vat: formData.apply_vat,
        other_charges: parseFloat(formData.other_charges) || 0,
        discount: parseFloat(formData.discount) || 0,
        coupon_code: formData.coupon_code,
        supplier_yacht_payable: parseFloat(formData.supplier_yacht_payable) || 0,
        supplier_extra_payable: parseFloat(formData.supplier_extra_payable) || 0,
        fine_penalty: parseFloat(formData.fine_penalty) || 0,
        total_price: totalPrice,
        status: 'confirmed',
        user_id: (await supabase.auth.getUser()).data.user?.id || '00000000-0000-0000-0000-000000000000',
      });

      if (error) throw error;

      toast.success(t('تم إنشاء الحجز بنجاح', 'Booking created successfully'));
      onSuccess();
      resetForm();
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error(t('حدث خطأ في إنشاء الحجز', 'Error creating booking'));
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalPrice = () => {
    const rate = parseFloat(formData.rate_per_hour) || 0;
    const duration = parseFloat(formData.duration_value) || 0;
    const otherCharges = parseFloat(formData.other_charges) || 0;
    const discount = parseFloat(formData.discount) || 0;
    const finePenalty = parseFloat(formData.fine_penalty) || 0;

    let subtotal = rate * duration + otherCharges + finePenalty - discount;
    
    if (formData.apply_vat) {
      subtotal = subtotal * 1.05; // 5% VAT
    }

    return subtotal;
  };

  const resetForm = () => {
    setFormData({
      title: '',
      first_name: '',
      last_name: '',
      customer_phone: '',
      address: '',
      customer_email: '',
      country: '',
      yacht_id: '',
      trip_start_time: '',
      trip_end_time: '',
      duration_value: '',
      number_of_persons: '',
      trip_type: '',
      rate_per_hour: '',
      apply_vat: true,
      other_charges: '0',
      discount: '0',
      coupon_code: '',
      supplier_yacht_payable: '0',
      supplier_extra_payable: '0',
      fine_penalty: '0',
    });
    setStartDate(undefined);
    setEndDate(undefined);
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold text-primary mb-6">
        {t('إنشاء حجز جديد', 'Create New Booking')}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-secondary">
            {t('معلومات العميل', 'Customer Information')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="title">{t('اللقب', 'Title')}</Label>
              <Select value={formData.title} onValueChange={(value) => setFormData({ ...formData, title: value })}>
                <SelectTrigger>
                  <SelectValue placeholder={t('اختر اللقب', 'Select Title')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mr">Mr</SelectItem>
                  <SelectItem value="Mrs">Mrs</SelectItem>
                  <SelectItem value="Ms">Ms</SelectItem>
                  <SelectItem value="Dr">Dr</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="first_name">{t('الاسم الأول', 'First Name')} *</Label>
              <Input
                id="first_name"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="last_name">{t('الاسم الأخير', 'Last Name')} *</Label>
              <Input
                id="last_name"
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="customer_phone">{t('رقم الهاتف', 'Phone Number')} *</Label>
              <Input
                id="customer_phone"
                type="tel"
                required
                value={formData.customer_phone}
                onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="customer_email">{t('البريد الإلكتروني', 'Email')} *</Label>
              <Input
                id="customer_email"
                type="email"
                required
                value={formData.customer_email}
                onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="country">{t('الدولة', 'Country')}</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <Label htmlFor="address">{t('العنوان', 'Address')}</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Trip Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-secondary">
            {t('معلومات الرحلة', 'Trip Information')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="yacht_id">{t('اليخت', 'Yacht')} *</Label>
              <Select value={formData.yacht_id} onValueChange={(value) => setFormData({ ...formData, yacht_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder={t('اختر اليخت', 'Select Yacht')} />
                </SelectTrigger>
                <SelectContent>
                  {yachts.map((yacht) => (
                    <SelectItem key={yacht.id} value={yacht.id}>
                      {yacht.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{t('تاريخ البداية', 'Trip Start Date')} *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !startDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP') : t('اختر تاريخ', 'Pick a date')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>{t('تاريخ النهاية', 'Trip End Date')} *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !endDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'PPP') : t('اختر تاريخ', 'Pick a date')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="trip_start_time">{t('وقت البداية', 'Trip Start Time')} *</Label>
              <Input
                id="trip_start_time"
                type="time"
                required
                value={formData.trip_start_time}
                onChange={(e) => setFormData({ ...formData, trip_start_time: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="trip_end_time">{t('وقت النهاية', 'Trip End Time')} *</Label>
              <Input
                id="trip_end_time"
                type="time"
                required
                value={formData.trip_end_time}
                onChange={(e) => setFormData({ ...formData, trip_end_time: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="duration_value">{t('مدة الرحلة', 'Trip Duration')}</Label>
              <Input
                id="duration_value"
                type="number"
                step="0.5"
                value={formData.duration_value}
                onChange={(e) => setFormData({ ...formData, duration_value: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="number_of_persons">{t('عدد الأشخاص', 'Number of Persons')}</Label>
              <Input
                id="number_of_persons"
                type="number"
                value={formData.number_of_persons}
                onChange={(e) => setFormData({ ...formData, number_of_persons: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="trip_type">{t('نوع الرحلة', 'Trip Type')} *</Label>
              <Select value={formData.trip_type} onValueChange={(value) => setFormData({ ...formData, trip_type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder={t('اختر النوع', 'Select Type')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">{t('بالساعة', 'Hourly')}</SelectItem>
                  <SelectItem value="daily">{t('يومي', 'Daily')}</SelectItem>
                  <SelectItem value="weekly">{t('أسبوعي', 'Weekly')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="rate_per_hour">{t('السعر بالساعة', 'Rate Per Hour')} *</Label>
              <Input
                id="rate_per_hour"
                type="number"
                step="0.01"
                required
                value={formData.rate_per_hour}
                onChange={(e) => setFormData({ ...formData, rate_per_hour: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-secondary">
            {t('معلومات الدفع', 'Payment Information')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="apply_vat"
                checked={formData.apply_vat}
                onCheckedChange={(checked) => setFormData({ ...formData, apply_vat: checked as boolean })}
              />
              <Label htmlFor="apply_vat">{t('تطبيق ضريبة القيمة المضافة', 'Apply VAT')}</Label>
            </div>

            <div>
              <Label htmlFor="other_charges">{t('رسوم أخرى', 'Other Charges')}</Label>
              <Input
                id="other_charges"
                type="number"
                step="0.01"
                value={formData.other_charges}
                onChange={(e) => setFormData({ ...formData, other_charges: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="discount">{t('الخصم', 'Discount')}</Label>
              <Input
                id="discount"
                type="number"
                step="0.01"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="coupon_code">{t('كود الكوبون', 'Coupon Code')}</Label>
              <Input
                id="coupon_code"
                value={formData.coupon_code}
                onChange={(e) => setFormData({ ...formData, coupon_code: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="supplier_yacht_payable">{t('مستحقات المورد لليخت', 'Supplier Yacht Payable')}</Label>
              <Input
                id="supplier_yacht_payable"
                type="number"
                step="0.01"
                value={formData.supplier_yacht_payable}
                onChange={(e) => setFormData({ ...formData, supplier_yacht_payable: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="supplier_extra_payable">{t('مستحقات المورد الإضافية', 'Supplier Extra Payable')}</Label>
              <Input
                id="supplier_extra_payable"
                type="number"
                step="0.01"
                value={formData.supplier_extra_payable}
                onChange={(e) => setFormData({ ...formData, supplier_extra_payable: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="fine_penalty">{t('الغرامة/العقوبة', 'Fine/Penalty')}</Label>
              <Input
                id="fine_penalty"
                type="number"
                step="0.01"
                value={formData.fine_penalty}
                onChange={(e) => setFormData({ ...formData, fine_penalty: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-xl font-bold text-secondary">
            {t('المبلغ الإجمالي:', 'Total Amount:')} {calculateTotalPrice().toFixed(2)} AED
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={resetForm}>
              {t('إعادة تعيين', 'Reset')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t('جاري الإنشاء...', 'Creating...') : t('إنشاء حجز', 'Create Booking')}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
};