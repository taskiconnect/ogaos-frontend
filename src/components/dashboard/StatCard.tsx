// components/ui/StatCard.tsx
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  trend: 'up' | 'down';
}

export default function StatCard({ title, value, change, icon: Icon, trend }: StatCardProps) {
  const isUp = trend === 'up';
  return (
    <Card className="bg-[rgba(255,255,255,0.03)] border-white/10 backdrop-blur-xl rounded-3xl overflow-hidden">
      <CardContent className="p-8">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-medium tracking-widest text-gray-400 uppercase">{title}</p>
            <p className="text-4xl font-semibold tracking-tighter text-white mt-3">{value}</p>
          </div>
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        </div>

        <div className={`mt-6 flex items-center gap-1 text-sm ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
          <span>{isUp ? '↑' : '↓'}</span>
          <span>{change}</span>
          <span className="text-gray-500">from last week</span>
        </div>
      </CardContent>
    </Card>
  );
}