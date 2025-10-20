import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Ship, Calendar, Users, Tag, BarChart, ShoppingCart, Settings } from 'lucide-react';
import { YachtManagement } from '@/components/admin/YachtManagement';
import { BookingManagement } from '@/components/admin/BookingManagement';
import { ClientManagement } from '@/components/admin/ClientManagement';
import { PromotionsManagement } from '@/components/admin/PromotionsManagement';
import { DashboardStats } from '@/components/admin/DashboardStats';
import { CartManagement } from '@/components/admin/CartManagement';
import { SettingsManagement } from '@/components/admin/SettingsManagement';
import { yachtService, bookingService, clientService, promotionService } from '@/lib/storage';
import { Yacht, Booking, Client, Promotion } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [yachts, setYachts] = useState<Yacht[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats');

  useEffect(() => {
    if (!user) {
      navigate('/admin');
      return;
    }
    loadData();

    // Set up real-time subscriptions for instant admin dashboard updates
    const yachtsChannel = supabase
      .channel('admin-yachts-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'yachts' },
        () => loadData()
      )
      .subscribe();

    const bookingsChannel = supabase
      .channel('admin-bookings-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        () => loadData()
      )
      .subscribe();

    const promotionsChannel = supabase
      .channel('admin-promotions-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'promotions' },
        () => loadData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(yachtsChannel);
      supabase.removeChannel(bookingsChannel);
      supabase.removeChannel(promotionsChannel);
    };
  }, [user, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [yachtsData, bookingsData, clientsData, promotionsData] = await Promise.all([
        yachtService.getYachts(),
        bookingService.getBookings(),
        clientService.getClients(),
        promotionService.getPromotions(),
      ]);
      setYachts(yachtsData);
      setBookings(bookingsData);
      setClients(clientsData);
      setPromotions(promotionsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('جاري التحميل...', 'Loading...')}</p>
        </div>
      </div>
    );
  }

  const pendingBookings = bookings.filter((b) => b.status === 'pending').length;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">
            {t('لوحة التحكم', 'Admin Dashboard')}
          </h1>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/')} variant="outline">
              {t('الصفحة الرئيسية', 'Home')}
            </Button>
            <Button onClick={handleLogout} variant="destructive">
              <LogOut className="w-4 h-4 ml-2" />
              {t('تسجيل الخروج', 'Logout')}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 lg:w-auto">
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart className="w-4 h-4" />
              <span className="hidden sm:inline">{t('الإحصائيات', 'Statistics')}</span>
            </TabsTrigger>
            <TabsTrigger value="yachts" className="flex items-center gap-2">
              <Ship className="w-4 h-4" />
              <span className="hidden sm:inline">{t('اليخوت', 'Yachts')}</span>
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">{t('الحجوزات', 'Bookings')}</span>
              {pendingBookings > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {pendingBookings}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="carts" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">{t('السلات', 'Carts')}</span>
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">{t('العملاء', 'Clients')}</span>
            </TabsTrigger>
            <TabsTrigger value="promotions" className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              <span className="hidden sm:inline">{t('العروض', 'Promotions')}</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">{t('الإعدادات', 'Settings')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="space-y-6">
            <DashboardStats
              totalYachts={yachts.length}
              totalBookings={bookings.length}
              pendingBookings={pendingBookings}
              totalClients={clients.length}
            />
          </TabsContent>

          <TabsContent value="yachts">
            <YachtManagement yachts={yachts} onUpdate={loadData} />
          </TabsContent>

          <TabsContent value="bookings">
            <BookingManagement bookings={bookings} onUpdate={loadData} />
          </TabsContent>

          <TabsContent value="carts">
            <CartManagement />
          </TabsContent>

          <TabsContent value="clients">
            <ClientManagement clients={clients} onUpdate={loadData} />
          </TabsContent>

        <TabsContent value="promotions">
          <PromotionsManagement promotions={promotions} yachts={yachts} onUpdate={loadData} />
        </TabsContent>

        <TabsContent value="settings">
          <SettingsManagement />
        </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
