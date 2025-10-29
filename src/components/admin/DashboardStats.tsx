import { Card } from '@/components/ui/card';
import { Ship, UtensilsCrossed, Settings, Users } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface DashboardStatsProps {
  totalYachts: number;
  totalFood: number;
  totalWaterSports: number;
  totalAdditionalServices: number;
}

export const DashboardStats = ({
  totalYachts,
  totalFood,
  totalWaterSports,
  totalAdditionalServices,
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
      title: t('إجمالي الطعام', 'Total Food'),
      value: totalFood,
      icon: UtensilsCrossed,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
    {
      title: t('إجمالي الرياضات المائية', 'Total Water Sports'),
      value: totalWaterSports,
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
    {
      title: t('إجمالي الخدمات الإضافية', 'Total Additional Services'),
      value: totalAdditionalServices,
      icon: Settings,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
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
