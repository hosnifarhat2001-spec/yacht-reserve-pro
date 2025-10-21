import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { ShoppingCart, Trash2, Calendar, Users, MapPin, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface CartItemWithYacht {
  id: string;
  session_id: string;
  yacht_id: string;
  start_date: string;
  end_date: string;
  price: number;
  created_at: string;
  yacht?: {
    id: string;
    name: string;
    description: string;
    main_image: string;
    capacity: number;
    location: string;
    features: string[];
    price_per_hour: number;
  };
}

export const CartManagement = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<CartItemWithYacht[]>([]);
  const [loading, setLoading] = useState(true);
  const [promotions, setPromotions] = useState<any[]>([]);

  const loadCartItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          yacht:yachts (
            id,
            name,
            description,
            main_image,
            capacity,
            location,
            features,
            price_per_hour
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('Admin cart items loaded:', data);
      setCartItems(data || []);
    } catch (error) {
      console.error('Error loading cart items:', error);
      toast({
        title: t('خطأ', 'Error'),
        description: t('فشل في تحميل عناصر السلة', 'Failed to load cart items'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCartItems();

    // Real-time subscription for cart changes
    const cartChannel = supabase
      .channel('cart-items-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cart_items' },
        () => loadCartItems()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(cartChannel);
    };
  }, []);

  useEffect(() => {
    loadCartItems();

    // Load active promotions
    const loadPromotions = async () => {
      const { data } = await supabase
        .from('promotions')
        .select('*')
        .eq('is_active', true);
      setPromotions(data || []);
    };
    loadPromotions();

    // Real-time subscription for cart changes
    const cartChannel = supabase
      .channel('admin-cart-items-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cart_items' },
        () => loadCartItems()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(cartChannel);
    };
  }, []);

  const handleDeleteCartItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: t('تم الحذف', 'Deleted'),
        description: t('تم حذف العنصر من السلة', 'Cart item removed'),
      });
      
      loadCartItems();
    } catch (error) {
      console.error('Error deleting cart item:', error);
      toast({
        title: t('خطأ', 'Error'),
        description: t('فشل في حذف العنصر', 'Failed to delete item'),
        variant: 'destructive',
      });
    }
  };

  const handleClearOldCarts = async () => {
    try {
      // Delete cart items older than 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .lt('created_at', sevenDaysAgo.toISOString());

      if (error) throw error;

      toast({
        title: t('تم التنظيف', 'Cleaned'),
        description: t('تم حذف السلات القديمة', 'Old carts removed'),
      });
      
      loadCartItems();
    } catch (error) {
      console.error('Error clearing old carts:', error);
      toast({
        title: t('خطأ', 'Error'),
        description: t('فشل في تنظيف السلات', 'Failed to clear carts'),
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    loadCartItems();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            {t('إدارة السلات', 'Cart Management')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t('جاري التحميل...', 'Loading...')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            {t('إدارة السلات', 'Cart Management')}
            <Badge variant="secondary">{cartItems.length}</Badge>
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadCartItems}>
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="destructive" size="sm" onClick={handleClearOldCarts}>
              {t('حذف السلات القديمة', 'Clear Old Carts')}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {cartItems.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              {t('لا توجد عناصر في السلة', 'No cart items')}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item) => {
              // Find active promotion
              const activePromo = promotions.find(p => p.is_active);
              
              return (
                <div key={item.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex gap-3">
                    {item.yacht?.main_image && (
                      <img
                        src={item.yacht.main_image}
                        alt={item.yacht.name}
                        className="w-32 h-32 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=200';
                        }}
                      />
                    )}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {item.yacht?.name || t('يخت غير معروف', 'Unknown Yacht')}
                          </h3>
                          {item.yacht?.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {item.yacht.description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {t('معرف الجلسة:', 'Session ID:')} {item.session_id.substring(0, 16)}...
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteCartItem(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {item.yacht?.capacity && (
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span>{item.yacht.capacity} {t('أشخاص', 'people')}</span>
                        </div>
                      )}
                      {item.yacht?.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>{item.yacht.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{new Date(item.start_date).toLocaleDateString()}</span>
                      </div>
                      <div className="font-semibold text-primary">
                        ${Number(item.price).toFixed(0)}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 pt-2 border-t">
                      <p className="text-base font-bold text-primary">
                        {item.yacht?.price_per_hour ? Number(item.yacht.price_per_hour).toFixed(0) : '0'} AED / {t('ساعة', 'hour')}
                      </p>
                    </div>

                    {activePromo && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                        {activePromo.discount_percentage}% {t('خصم', 'OFF')} - {activePromo.title}
                      </Badge>
                    )}

                    {item.yacht?.features && item.yacht.features.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {item.yacht.features.map((feature: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground pt-2 border-t">
                      {t('تم الإضافة:', 'Added:')} {new Date(item.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
