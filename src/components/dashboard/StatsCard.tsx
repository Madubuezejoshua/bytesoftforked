import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  iconBgColor: string;
  iconColor: string;
  gradient?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({
  icon: Icon,
  label,
  value,
  iconBgColor,
  iconColor,
  gradient = false,
}) => {
  return (
    <Card className={`p-6 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
      gradient ? 'bg-gradient-to-br from-blue-50 to-slate-50 dark:from-slate-800 dark:to-slate-900' : ''
    }`}>
      <div className="relative">
        <div className="absolute -right-8 -top-8 w-24 h-24 bg-gradient-to-br from-blue-100 to-transparent rounded-full opacity-30 dark:from-blue-900/30" />

        <div className="flex items-center justify-between relative z-10">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">{label}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
          </div>

          <div className={`p-4 rounded-2xl shadow-md transition-transform duration-300 hover:scale-110 ${iconBgColor}`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StatsCard;
