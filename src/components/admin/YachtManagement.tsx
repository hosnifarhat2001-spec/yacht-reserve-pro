import { useState, useEffect } from 'react';
import { Yacht, YachtOption } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, X, MapPin, Upload, Image as ImageIcon } from 'lucide-react';
import { yachtService } from '@/lib/storage';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { Switch } from '@/components/ui/switch';

interface YachtManagementProps {
  yachts: Yacht[];
  onUpdate: () => void;
}

export const YachtManagement = ({ yachts, onUpdate }: YachtManagementProps) => {
  const { t } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [editingYacht, setEditingYacht] = useState<Yacht | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    main_image: '',
    capacity: null as number | null,
    length: null as number | null,
    price_per_hour: null as number | null,
    location: '',
    is_available: true,
    features: [] as string[],
  });
  const [yachtOptions, setYachtOptions] = useState<YachtOption[]>([]);
  const [optionsByYacht, setOptionsByYacht] = useState<Record<string, YachtOption[]>>({});
  const [newOption, setNewOption] = useState({
    name: '',
    price: 0,
    description: '',
    is_active: true,
  });
  const [featuresInput, setFeaturesInput] = useState('');
  const [yachtImages, setYachtImages] = useState<Array<{ id: string; image_url: string; display_order: number }>>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [newYachtImages, setNewYachtImages] = useState<Array<{ file: File; displayOrder: number | null }>>([]);
  const [newMainIndex, setNewMainIndex] = useState<number | null>(null);

  useEffect(() => {
    if (editingYacht) {
      loadYachtOptions(editingYacht.id);
      loadYachtImages(editingYacht.id);
    }
  }, [editingYacht]);

  // Load options for all yachts to show on cards
  useEffect(() => {
    const loadAllOptions = async () => {
      try {
        const ids = yachts.map((y) => y.id);
        if (ids.length === 0) return;
        const { data, error } = await supabase
          .from('yacht_options')
          .select('*')
          .in('yacht_id', ids)
          .order('display_order');
        if (error) throw error;
        const map: Record<string, YachtOption[]> = {};
        (data || []).forEach((opt: any) => {
          const arr = map[opt.yacht_id] || [];
          arr.push(opt as YachtOption);
          map[opt.yacht_id] = arr;
        });
        setOptionsByYacht(map);
      } catch (e) {
        console.error('Error loading options for all yachts', e);
      }
    };
    loadAllOptions();
  }, [yachts]);

  const loadYachtOptions = async (yachtId: string) => {
    try {
      const { data, error } = await supabase
        .from('yacht_options')
        .select('*')
        .eq('yacht_id', yachtId)
        .order('display_order');
      
      if (error) throw error;
      setYachtOptions(data || []);
    } catch (error) {
      console.error('Error loading options:', error);
    }
  };

  const loadYachtImages = async (yachtId: string) => {
    try {
      const { data, error } = await supabase
        .from('yacht_images')
        .select('*')
        .eq('yacht_id', yachtId)
        .order('display_order');
      
      if (error) throw error;
      setYachtImages(data || []);
    } catch (error) {
      console.error('Error loading images:', error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingYacht) {
      toast.error(t('يرجى حفظ اليخت أولاً قبل إضافة الصور', 'Please save the yacht first before adding images'));
      return;
    }

    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (yachtImages.length + files.length > 10) {
      toast.error(t('يمكنك إضافة 10 صور كحد أقصى', 'You can add maximum 10 images'));
      return;
    }

    setUploadingImages(true);
    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${editingYacht.id}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('yacht-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('yacht-images')
          .getPublicUrl(filePath);

        const { error: insertError } = await supabase
          .from('yacht_images')
          .insert({
            yacht_id: editingYacht.id,
            image_url: publicUrl,
            display_order: yachtImages.length
          });

        if (insertError) throw insertError;
      }

      toast.success(t('تم رفع الصور بنجاح', 'Images uploaded successfully'));
      loadYachtImages(editingYacht.id);
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error(t('خطأ في رفع الصور', 'Error uploading images'));
    } finally {
      setUploadingImages(false);
    }
  };

  const handleDeleteImage = async (imageId: string, imageUrl: string) => {
    try {
      const fileName = imageUrl.split('/').pop();
      if (fileName) {
        await supabase.storage.from('yacht-images').remove([fileName]);
      }

      const { error } = await supabase
        .from('yacht_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;

      toast.success(t('تم حذف الصورة', 'Image deleted'));
      if (editingYacht) loadYachtImages(editingYacht.id);
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error(t('خطأ في حذف الصورة', 'Error deleting image'));
    }
  };

  const handleSetMainImage = async (imageUrl: string) => {
    if (!editingYacht) return;
    try {
      const { error } = await supabase
        .from('yachts')
        .update({ main_image: imageUrl })
        .eq('id', editingYacht.id);
      if (error) throw error;
      setFormData((prev) => ({ ...prev, main_image: imageUrl }));
      setEditingYacht({ ...(editingYacht as Yacht), main_image: imageUrl });
      toast.success(t('تم تعيين الصورة الرئيسية', 'Main image set'));
    } catch (e) {
      console.error('Error setting main image:', e);
      toast.error(t('فشل تعيين الصورة الرئيسية', 'Failed to set main image'));
    }
  };

  const handleSetDisplayOrder = async (imageId: string, order: number) => {
    if (!editingYacht) return;
    try {
      const { error } = await supabase
        .from('yacht_images')
        .update({ display_order: order })
        .eq('id', imageId);
      
      if (error) throw error;
      await loadYachtImages(editingYacht.id);
      toast.success(t(`تم تعيين كصورة مميزة #${order}`, `Set as featured #${order}`));
    } catch (e) {
      console.error('Error setting display order:', e);
      toast.error(t('فشل تعيين الترتيب', 'Failed to set display order'));
    }
  };

  const handleSelectNewImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const selected = Array.from(files);
    const total = newYachtImages.length + selected.length;
    if (total > 10) {
      toast.error(t('يمكنك إضافة 10 صور كحد أقصى', 'You can add maximum 10 images'));
      return;
    }

    setNewYachtImages((prev) => {
      const next = [...prev, ...selected.map(file => ({ file, displayOrder: null }))];
      if (prev.length === 0 && next.length > 0) setNewMainIndex(0);
      return next;
    });
  };

  const handleRemoveNewImage = (index: number) => {
    setNewYachtImages((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (newMainIndex !== null) {
        if (index === newMainIndex) {
          setNewMainIndex(next.length > 0 ? 0 : null);
        } else if (index < newMainIndex) {
          setNewMainIndex(newMainIndex - 1);
        }
      }
      return next;
    });
  };

  const handleSetNewImageDisplayOrder = (index: number, order: number) => {
    setNewYachtImages((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], displayOrder: order };
      return next;
    });
  };

  const handleAddOption = async () => {
    if (!newOption.name || newOption.price <= 0) {
      toast.error(t('يرجى ملء جميع حقول الخيار', 'Please fill all option fields'));
      return;
    }

    if (!editingYacht) {
      // Add to temporary list for new yacht
      setYachtOptions([...yachtOptions, { 
        ...newOption, 
        id: `temp-${Date.now()}`, 
        yacht_id: '',
        display_order: yachtOptions.length 
      } as YachtOption]);
      setNewOption({ name: '', price: 0, description: '', is_active: true });
      return;
    }

    try {
      const { error } = await supabase
        .from('yacht_options')
        .insert({
          ...newOption,
          yacht_id: editingYacht.id,
          display_order: yachtOptions.length,
        });
      
      if (error) throw error;
      toast.success(t('تم إضافة الخيار', 'Option added'));
      loadYachtOptions(editingYacht.id);
      setNewOption({ name: '', price: 0, description: '', is_active: true });
    } catch (error) {
      console.error('Error adding option:', error);
      toast.error(t('خطأ في إضافة الخيار', 'Error adding option'));
    }
  };

  const handleDeleteOption = async (optionId: string) => {
    if (optionId.startsWith('temp-')) {
      setYachtOptions(yachtOptions.filter(o => o.id !== optionId));
      return;
    }

    try {
      const { error } = await supabase
        .from('yacht_options')
        .delete()
        .eq('id', optionId);
      
      if (error) throw error;
      toast.success(t('تم حذف الخيار', 'Option deleted'));
      if (editingYacht) loadYachtOptions(editingYacht.id);
    } catch (error) {
      console.error('Error deleting option:', error);
      toast.error(t('خطأ في حذف الخيار', 'Error deleting option'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const payload = formData;
      if (editingYacht) {
        // Update yacht data
        const { error: updateError } = await supabase
          .from('yachts')
          .update(payload)
          .eq('id', editingYacht.id);
        
        if (updateError) {
          console.error('Yacht update error:', updateError);
          throw new Error(updateError.message || 'Failed to update yacht');
        }
        
        toast.success(t('تم تحديث اليخت بنجاح', 'Yacht updated successfully'));
      } else {
        // Add yacht directly using supabase to get the ID back
        const { data: newYacht, error: yachtError } = await supabase
          .from('yachts')
          .insert(payload)
          .select()
          .single();
        
        if (yachtError) {
          console.error('Yacht insert error:', yachtError);
          throw new Error(yachtError.message || 'Failed to add yacht');
        }
        
        // Add temporary options for new yacht
        if (yachtOptions.length > 0 && newYacht) {
          const optionsToInsert = yachtOptions.map((opt, index) => ({
            yacht_id: newYacht.id,
            name: opt.name,
            price: opt.price,
            description: opt.description,
            is_active: opt.is_active,
            display_order: index,
          }));
          
          const { error: optionsError } = await supabase
            .from('yacht_options')
            .insert(optionsToInsert);
          
          if (optionsError) {
            console.error('Options insert error:', optionsError);
            throw new Error(optionsError.message || 'Failed to add options');
          }
        }

        // Upload selected images (if any) and create yacht_images rows
        if (newYacht && newYachtImages.length > 0) {
          const uploadedData: Array<{ url: string; displayOrder: number | null }> = [];
          setUploadingImages(true);
          try {
            for (let i = 0; i < newYachtImages.length; i++) {
              const { file, displayOrder } = newYachtImages[i];
              const fileExt = file.name.split('.').pop();
              const fileName = `${newYacht.id}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
              const filePath = `${fileName}`;

              const { error: uploadError } = await supabase.storage
                .from('yacht-images')
                .upload(filePath, file);
              if (uploadError) throw uploadError;

              const { data: { publicUrl } } = supabase.storage
                .from('yacht-images')
                .getPublicUrl(filePath);
              uploadedData.push({ url: publicUrl, displayOrder });
            }

            // Insert rows into yacht_images with display_order
            const imagesToInsert = uploadedData.map(({ url, displayOrder }, index) => ({
              yacht_id: newYacht.id,
              image_url: url,
              display_order: displayOrder ?? index,
            }));
            const { error: imagesError } = await supabase
              .from('yacht_images')
              .insert(imagesToInsert);
            if (imagesError) throw imagesError;

            // Set main_image to chosen preview (fallback to first)
            const chosenIndex = newMainIndex ?? 0;
            if (uploadedData[chosenIndex]) {
              const { error: mainImgErr } = await supabase
                .from('yachts')
                .update({ main_image: uploadedData[chosenIndex].url })
                .eq('id', newYacht.id);
              if (mainImgErr) throw mainImgErr;
            }
          } finally {
            setUploadingImages(false);
          }
        }
        
        toast.success(t('تم إضافة اليخت بنجاح', 'Yacht added successfully'));
      }
      
      resetForm();
      onUpdate();
    } catch (error: any) {
      console.error('Error saving yacht:', error);
      const errorMessage = error?.message || t('حدث خطأ في حفظ اليخت', 'Error saving yacht');
      toast.error(errorMessage);
    }
  };

  const handleEdit = (yacht: Yacht) => {
    setEditingYacht(yacht);
    setFormData({
      name: yacht.name,
      description: yacht.description || '',
      main_image: yacht.main_image || '',
      capacity: yacht.capacity ?? null,
      length: yacht.length ?? null,
      price_per_hour: yacht.price_per_hour ?? null,
      location: yacht.location || '',
      is_available: yacht.is_available ?? true,
      features: yacht.features || [],
    });
    setFeaturesInput((yacht.features || []).join(', '));
    setYachtOptions([]);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('هل أنت متأكد من حذف هذا اليخت؟', 'Are you sure you want to delete this yacht?'))) {
      try {
        await yachtService.deleteYacht(id);
        toast.success(t('تم حذف اليخت بنجاح', 'Yacht deleted successfully'));
        onUpdate();
      } catch (error) {
        console.error('Error deleting yacht:', error);
        toast.error(t('حدث خطأ في حذف اليخت', 'Error deleting yacht'));
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      main_image: '',
      capacity: null,
      length: null,
      price_per_hour: null,
      location: '',
      is_available: true,
      features: [],
    });
    setFeaturesInput('');
    setEditingYacht(null);
    setYachtOptions([]);
    setYachtImages([]);
    setNewYachtImages([]);
    setNewMainIndex(null);
    setNewOption({ name: '', price: 0, description: '', is_active: true });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">{t('إدارة اليخوت', 'Yacht Management')}</h2>
        <Button onClick={() => setShowForm(true)} className="bg-gradient-ocean">
          <Plus className="w-4 h-4 ml-2" />
          {t('إضافة يخت جديد', 'Add New Yacht')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {yachts.map((yacht) => {
          const images = optionsByYacht[yacht.id] || [];
          return (
            <Card key={yacht.id} className="overflow-hidden">
              {yacht.main_image && (
                <img src={yacht.main_image} alt={yacht.name} className="w-full h-48 object-cover" />
              )}
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">{yacht.name}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{yacht.description}</p>
                {/* Key facts */}
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>
                    <span className="text-muted-foreground">{t('السعة', 'Capacity')}:</span> {yacht.capacity}
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t('الطول', 'Length')}:</span> {yacht.length ?? '-'}
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t('السعر/ساعة', 'Price/Hour')}:</span> {yacht.price_per_hour} AED
                  </div>
                </div>

              {/* Location */}
              {yacht.location && (
                <div className="flex items-center gap-2 text-sm mb-3">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{t('الموقع', 'Location')}:</span>
                  <span>{yacht.location}</span>
                </div>
              )}

              {/* Options */}
              {Array.isArray(optionsByYacht[yacht.id]) && optionsByYacht[yacht.id].filter((o)=>o.is_active!==false).length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">{t('الخيارات', 'Options')}</p>
                  <div className="flex flex-wrap gap-2">
                    {optionsByYacht[yacht.id]
                      .filter((opt) => opt.is_active !== false)
                      .map((opt) => (
                        <Badge key={opt.id} variant="secondary" className="text-xs">
                          {opt.name} · {opt.price} AED
                        </Badge>
                      ))}
                  </div>
                </div>
              )}

              {/* Features */}
              {Array.isArray(yacht.features) && yacht.features.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">{t('المميزات', 'Features')}</p>
                  <div className="flex flex-wrap gap-2">
                    {yacht.features.map((f, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {f}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <Button onClick={() => handleEdit(yacht)} variant="outline" size="sm" className="flex-1">
                  <Edit className="w-4 h-4 ml-1" />
                  {t('تعديل', 'Edit')}
                </Button>
                <Button onClick={() => handleDelete(yacht.id)} variant="destructive" size="sm" className="flex-1">
                  <Trash2 className="w-4 h-4 ml-1" />
                  {t('حذف', 'Delete')}
                </Button>
              </div>
            </div>
          </Card>
        );
        })}
      </div>

      <Dialog open={showForm} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingYacht ? t('تعديل اليخت', 'Edit Yacht') : t('إضافة يخت جديد', 'Add New Yacht')}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>{t('الاسم', 'Name')}</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label>{t('الوصف', 'Description')}</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Yacht Images Section */}
            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-semibold mb-4">
                {t('صور اليخت', 'Yacht Images')} ({yachtImages.length}/10)
              </h3>
              
              {editingYacht && yachtImages.length > 0 && (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {yachtImages.map((img, idx) => (
                    <div key={img.id} className="relative group rounded-lg overflow-hidden border">
                      <img 
                        src={img.image_url} 
                        alt={`Yacht ${idx + 1}`}
                        className="w-full h-32 object-cover"
                      />
                      <div className="absolute top-2 left-2 flex gap-2 flex-wrap">
                        {formData.main_image === img.image_url ? (
                          <span className="px-2 py-0.5 text-xs bg-primary text-white rounded">{t('رئيسية', 'Main')}</span>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => handleSetMainImage(img.image_url)}
                            className="h-6 px-2 text-xs"
                          >
                            {t('تعيين كصورة رئيسية', 'Set as main')}
                          </Button>
                        )}
                      </div>
                      <div className="absolute bottom-2 left-2 flex gap-1 flex-wrap max-w-[140px]">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(order => (
                          <Button
                            key={order}
                            type="button"
                            size="sm"
                            variant={img.display_order === order ? "default" : "outline"}
                            onClick={() => handleSetDisplayOrder(img.id, order)}
                            className="h-6 w-6 p-0 text-xs"
                            title={t(`تعيين كصورة مميزة #${order}`, `Set as featured #${order}`)}
                          >
                            {order}
                          </Button>
                        ))}
                      </div>
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDeleteImage(img.id, img.image_url)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {!editingYacht && newYachtImages.length > 0 && (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {newYachtImages.map((item, idx) => (
                    <div key={idx} className="relative group rounded-lg overflow-hidden border">
                      <img
                        src={URL.createObjectURL(item.file)}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-32 object-cover"
                      />
                      <div className="absolute top-2 left-2 flex gap-2">
                        {newMainIndex === idx ? (
                          <span className="px-2 py-0.5 text-xs bg-primary text-white rounded">{t('رئيسية', 'Main')}</span>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => setNewMainIndex(idx)}
                            className="h-6 px-2 text-xs"
                          >
                            {t('تعيين كصورة رئيسية', 'Set as main')}
                          </Button>
                        )}
                      </div>
                      <div className="absolute bottom-2 left-2 flex gap-1 flex-wrap max-w-[140px]">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(order => (
                          <Button
                            key={order}
                            type="button"
                            size="sm"
                            variant={item.displayOrder === order ? "default" : "outline"}
                            onClick={() => handleSetNewImageDisplayOrder(idx, order)}
                            className="h-6 w-6 p-0 text-xs"
                            title={t(`تعيين كصورة مميزة #${order}`, `Set as featured #${order}`)}
                          >
                            {order}
                          </Button>
                        ))}
                      </div>
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveNewImage(idx)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {editingYacht && yachtImages.length < 10 && (
                <div>
                  <Label 
                    htmlFor="image-upload" 
                    className="flex items-center justify-center gap-2 p-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    {uploadingImages ? (
                      <span className="text-sm text-muted-foreground">
                        {t('جاري الرفع...', 'Uploading...')}
                      </span>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {t('اضغط لرفع صور (حتى 10 صور)', 'Click to upload images (up to 10)')}
                        </span>
                      </>
                    )}
                  </Label>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploadingImages}
                  />
                </div>
              )}

              {!editingYacht && newYachtImages.length < 10 && (
                <div>
                  <Label 
                    htmlFor="new-image-upload" 
                    className="flex items-center justify-center gap-2 p-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <Upload className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {t('اختر صورًا لإرفاقها عند إضافة اليخت (حتى 10 صور)', 'Choose images to attach when adding the yacht (up to 10)')}
                    </span>
                  </Label>
                  <Input
                    id="new-image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleSelectNewImages}
                    disabled={uploadingImages}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('السعة', 'Capacity (people)')}</Label>
                <Input
                  type="number"
                  value={formData.capacity ?? ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    setFormData({ ...formData, capacity: v === '' ? null : Number(v) });
                  }}
                  required
                />
              </div>
              <div>
                <Label>{t('الطول', 'Length (meters)')}</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.length ?? ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    setFormData({ ...formData, length: v === '' ? null : Number(v) });
                  }}
                  placeholder="e.g., 25.5"
                />
              </div>
            </div>

            <div>
              <Label>{t('السعر بالساعة', 'Price/Hour (AED)')}</Label>
              <Input
                type="number"
                value={formData.price_per_hour ?? ''}
                onChange={(e) => {
                  const v = e.target.value;
                  setFormData({ ...formData, price_per_hour: v === '' ? null : Number(v) });
                }}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('الموقع', 'Location')}</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder={t('المدينة أو المرسى', 'City or Marina')}
                />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch
                  checked={formData.is_available}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
                />
                <Label>{t('متاح للحجز', 'Available for booking')}</Label>
              </div>
            </div>

            {/* Features */}
            <div>
              <Label>{t('المميزات', 'Features')}</Label>
              <Input
                value={featuresInput}
                onChange={(e) => {
                  const value = e.target.value;
                  setFeaturesInput(value);
                  const arr = value
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean);
                  setFormData({ ...formData, features: arr });
                }}
                placeholder={t('افصل بين المميزات بفواصل، مثال: نظام صوتي, سطح شمسي, طاقم', 'Comma-separated, e.g., Sound system, Sun deck, Crew')}
              />
              {formData.features.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.features.map((f, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {f}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Yacht Options Section */}
            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-semibold mb-4">{t('خيارات اليخت', 'Yacht Options')}</h3>
              
              {/* Existing Options */}
              <div className="space-y-2 mb-4">
                {yachtOptions.map((option) => (
                  <div key={option.id} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{option.name}</p>
                      {option.description && (
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      )}
                      <p className="text-sm font-semibold text-primary">{option.price} AED</p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteOption(option.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Add New Option */}
              <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium text-sm">{t('إضافة خيار جديد', 'Add New Option')}</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm">{t('اسم الخيار', 'Option Name')}</Label>
                    <Input
                      value={newOption.name}
                      onChange={(e) => setNewOption({ ...newOption, name: e.target.value })}
                      placeholder="e.g., Jet Ski"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">{t('السعر', 'Price (AED)')}</Label>
                    <Input
                      type="number"
                      value={newOption.price}
                      onChange={(e) => setNewOption({ ...newOption, price: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm">{t('الوصف', 'Description')}</Label>
                  <Input
                    value={newOption.description}
                    onChange={(e) => setNewOption({ ...newOption, description: e.target.value })}
                    placeholder="Optional description"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={newOption.is_active}
                    onCheckedChange={(checked) => setNewOption({ ...newOption, is_active: checked })}
                  />
                  <Label className="text-sm">{t('نشط', 'Active')}</Label>
                </div>
                <Button
                  type="button"
                  onClick={handleAddOption}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('إضافة خيار', 'Add Option')}
                </Button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="button" onClick={resetForm} variant="outline" className="flex-1">
                {t('إلغاء', 'Cancel')}
              </Button>
              <Button type="submit" className="flex-1 bg-gradient-ocean">
                {editingYacht ? t('تحديث', 'Update') : t('إضافة', 'Add')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
