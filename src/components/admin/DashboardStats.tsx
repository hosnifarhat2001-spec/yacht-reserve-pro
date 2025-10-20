import { Card } from '@/components/ui/card';
import { Ship, Calendar, Users, TrendingUp, DollarSign } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface DashboardStatsProps {
  totalYachts: number;
  totalBookings: number;
  pendingBookings: number;
  totalClients: number;
}

export const DashboardStats = ({
  totalYachts,
  totalBookings,
  pendingBookings,
  totalClients,
}: DashboardStatsProps) => {
  const { t } = useLanguage();

  const stats = [
    {
      title: t('إجمالي اليخوت', 'Total Yachts'),
      value: totalYachts,
      icon: Ship,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100',
    },
    {
      title: t('إجمالي الحجوزات', 'Total Bookings'),
      value: totalBookings,
      icon: Calendar,
      color: 'text-green-500',
      bgColor: 'bg-green-100',
    },
    {
      title: t('الحجوزات المعلقة', 'Pending Bookings'),
      value: pendingBookings,
      icon: TrendingUp,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100',
    },
    {
      title: t('إجمالي المبلغ', 'Total Amount'),
      value: totalClients,
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => (
        <Card key={stat.title} className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
              <p className="text-3xl font-bold">{stat.value}</p>
            </div>
            <div className={`${stat.bgColor} p-3 rounded-lg`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
