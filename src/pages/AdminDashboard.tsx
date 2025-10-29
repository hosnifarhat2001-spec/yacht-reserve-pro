import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Ship, Calendar, Tag, BarChart, Settings } from 'lucide-react';
import { YachtManagement } from '@/components/admin/YachtManagement';
import { PromotionsManagement } from '@/components/admin/PromotionsManagement';
import { DashboardStats } from '@/components/admin/DashboardStats';
import { SettingsManagement } from '@/components/admin/SettingsManagement';
import WaterSportsManagement from '@/components/admin/WaterSportsManagement';
import FoodManagement from '@/components/admin/FoodManagement';
import AdditionalServicesManagement from '@/components/admin/AdditionalServicesManagement';
import { yachtService, clientService, promotionService } from '@/lib/storage';
import { Yacht, Client, Promotion } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [yachts, setYachts] = useState<Yacht[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [waterSports, setWaterSports] = useState<any[]>([]);
  const [foodItems, setFoodItems] = useState<any[]>([]);
  const [additionalServices, setAdditionalServices] = useState<any[]>([]);
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
      
      supabase.removeChannel(promotionsChannel);
    };
  }, [user, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [yachtsData, clientsData, promotionsData] = await Promise.all([
        yachtService.getYachts(),
        clientService.getClients(),
        promotionService.getPromotions(),
      ]);
      
      // Load water sports, food items, and additional services
      const { data: waterSportsData } = await supabase.from("water_sports").select("*").order("display_order");
      const { data: foodItemsData } = await supabase.from("food_items").select("*").order("display_order");
      const { data: additionalServicesData } = await supabase.from("additional_services").select("*").order("display_order");
      
      setYachts(yachtsData);
      setClients(clientsData);
      setPromotions(promotionsData);
      setWaterSports(waterSportsData || []);
      setFoodItems(foodItemsData || []);
      setAdditionalServices(additionalServicesData || []);
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
            
            <TabsTrigger value="water-sports" className="flex items-center gap-2">
              <Ship className="w-4 h-4" />
              <span className="hidden sm:inline">Sports</span>
            </TabsTrigger>
            <TabsTrigger value="food" className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              <span className="hidden sm:inline">Food</span>
            </TabsTrigger>
            <TabsTrigger value="additional-services" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Services</span>
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
              totalFood={foodItems.length}
              totalWaterSports={waterSports.length}
              totalAdditionalServices={additionalServices.length}
            />
          </TabsContent>

          <TabsContent value="yachts">
            <YachtManagement yachts={yachts} onUpdate={loadData} />
          </TabsContent>

          

          <TabsContent value="water-sports">
            <WaterSportsManagement activities={waterSports} onUpdate={loadData} />
          </TabsContent>

          <TabsContent value="food">
            <FoodManagement foodItems={foodItems} onUpdate={loadData} />
          </TabsContent>

          <TabsContent value="additional-services">
            <AdditionalServicesManagement services={additionalServices} onUpdate={loadData} />
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
