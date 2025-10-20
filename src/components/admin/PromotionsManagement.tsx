import { useState } from 'react';
import { Promotion, Yacht } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Trash2, Edit, Plus, Tag, Search } from 'lucide-react';
import { promotionService } from '@/lib/storage';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

interface PromotionsManagementProps {
  promotions: Promotion[];
  yachts: Yacht[];
  onUpdate: () => void;
}

export const PromotionsManagement = ({ promotions, yachts, onUpdate }: PromotionsManagementProps) => {
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    description: '',
    discount_percentage: 0,
    valid_from: '',
    valid_until: '',
    is_active: true,
    yacht_id: '',
  });

  const filteredPromotions = promotions.filter(
    (promo) =>
      (promo.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (promo.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async () => {
    console.log('Submitting promotion form:', formData);
    
    // Validation
    if (!formData.title.trim()) {
      toast.error(t('يرجى إدخال عنوان العرض', 'Please enter promotion title'));
      return;
    }
    
    if (formData.discount_percentage <= 0 || formData.discount_percentage > 100) {
      toast.error(t('يرجى إدخال نسبة خصم صحيحة (1-100)', 'Please enter valid discount percentage (1-100)'));
      return;
    }

    try {
      // Convert empty yacht_id to null
      const submissionData = {
        ...formData,
        yacht_id: formData.yacht_id || null,
      };
      
      console.log('Processed submission data:', submissionData);
      
      if (editingPromotion) {
        await promotionService.updatePromotion(editingPromotion.id, submissionData);
        toast.success(t('تم تحديث العرض', 'Promotion updated successfully'));
      } else {
        await promotionService.addPromotion(submissionData);
        toast.success(t('تم إضافة العرض', 'Promotion added successfully'));
      }
      resetForm();
      onUpdate();
    } catch (error) {
      console.error('Error saving promotion:', error);
      toast.error(t('حدث خطأ في حفظ العرض', 'Error saving promotion'));
    }
  };

  const handleEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setFormData({
      title: promotion.title,
      code: promotion.code || '',
      description: promotion.description || '',
      discount_percentage: promotion.discount_percentage || 0,
      valid_from: promotion.valid_from || '',
      valid_until: promotion.valid_until || '',
      is_active: promotion.is_active,
      yacht_id: promotion.yacht_id ? String(promotion.yacht_id) : '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('هل أنت متأكد من حذف هذا العرض؟', 'Are you sure you want to delete this promotion?'))) {
      try {
        await promotionService.deletePromotion(id);
        toast.success(t('تم حذف العرض', 'Promotion deleted successfully'));
        onUpdate();
      } catch (error) {
        console.error('Error deleting promotion:', error);
        toast.error(t('حدث خطأ في حذف العرض', 'Error deleting promotion'));
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      code: '',
      description: '',
      discount_percentage: 0,
      valid_from: '',
      valid_until: '',
      is_active: true,
      yacht_id: '',
    });
    setEditingPromotion(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">
          {t('إدارة العروض', 'Promotions Management')}
        </h2>
        <div className="flex gap-2">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder={t('بحث...', 'Search...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 ml-1" />
            {t('إضافة عرض', 'Add Promotion')}
          </Button>
        </div>
      </div>

      {filteredPromotions.length === 0 ? (
        <Card className="p-12 text-center">
          <Tag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-xl text-muted-foreground">
            {t('لا توجد عروض حتى الآن', 'No promotions yet')}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPromotions.map((promo) => {
            const yacht = yachts.find(y => y.id === promo.yacht_id);
            return (
              <Card key={promo.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold">{promo.code || promo.title}</h3>
                      <span className={`px-2 py-1 rounded text-xs ${promo.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {promo.is_active ? t('نشط', 'Active') : t('غير نشط', 'Inactive')}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{promo.description}</p>
                    <p className="text-2xl font-bold text-secondary">{promo.discount_percentage}% {t('خصم', 'OFF')}</p>
                    {yacht && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {t('اليخت:', 'Yacht:')} {yacht.name}
                      </p>
                    )}
                    {!promo.yacht_id && (
                      <p className="text-sm text-amber-600 mt-2">
                        {t('جميع اليخوت', 'All Yachts')}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleEdit(promo)} variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => handleDelete(promo.id)} variant="destructive" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  {promo.valid_from && promo.valid_until && (
                    <p>{t('من:', 'From:')} {promo.valid_from} {t('إلى:', 'To:')} {promo.valid_until}</p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={(open) => { if (!open) resetForm(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background">
          <DialogHeader>
            <DialogTitle>
              {editingPromotion ? t('تعديل عرض', 'Edit Promotion') : t('إضافة عرض جديد', 'Add New Promotion')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>{t('العنوان', 'Title')}</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder={t('عنوان العرض', 'Promotion title')}
                required
              />
            </div>
            <div>
              <Label>{t('كود العرض', 'Promotion Code')}</Label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder={t('مثال: SUMMER2025', 'e.g., SUMMER2025')}
              />
            </div>
            <div>
              <Label>{t('الوصف', 'Description')}</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t('وصف العرض', 'Promotion description')}
              />
            </div>
            <div>
              <Label>{t('نسبة الخصم (%)', 'Discount Percentage (%)')}</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.discount_percentage}
                onChange={(e) => setFormData({ ...formData, discount_percentage: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <Label>{t('اختيار اليخت (اختياري)', 'Select Yacht (Optional)')}</Label>
              <Select 
                value={formData.yacht_id || undefined}
                onValueChange={(value) => setFormData({ ...formData, yacht_id: value === 'all' ? '' : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('اختر يختًا', 'Select a yacht')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('جميع اليخوت', 'All Yachts')}</SelectItem>
                  {yachts
                    .filter((yacht) => yacht && yacht.id !== undefined && yacht.id !== null && String(yacht.id).trim() !== '')
                    .map((yacht) => (
                      <SelectItem key={String(yacht.id)} value={String(yacht.id)}>
                        {yacht.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {t('اختر يخت محدد أو اتركه فارغاً لتطبيقه على جميع اليخوت', 'Select a specific yacht or leave empty to apply to all yachts')}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('تاريخ البداية', 'Start Date')}</Label>
                <Input
                  type="date"
                  value={formData.valid_from}
                  onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                />
              </div>
              <div>
                <Label>{t('تاريخ النهاية', 'End Date')}</Label>
                <Input
                  type="date"
                  value={formData.valid_until}
                  onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label>{t('نشط', 'Active')}</Label>
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={resetForm}>
                {t('إلغاء', 'Cancel')}
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={!formData.title.trim() || formData.discount_percentage <= 0}
              >
                {t('حفظ', 'Save')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};