// components/dashboard/QuickActions.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Plus, Send, UserPlus, FileText, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

const actions = [
  { label: 'Record New Sale', icon: Plus, color: 'bg-emerald-500' },
  { label: 'Send Debt Reminder', icon: Send, color: 'bg-rose-500' },
  { label: 'Add New Staff', icon: UserPlus, color: 'bg-blue-500' },
  { label: 'Generate Invoice', icon: FileText, color: 'bg-amber-500' },
];

export default function QuickActions() {
  return (
    <div className="bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-3xl p-8">
      <div className="font-semibold mb-6">Quick Actions</div>
      
      <div className="grid grid-cols-2 gap-4">
        {actions.map((action, i) => {
          const Icon = action.icon;
          return (
            <Button
              key={i}
              variant="outline"
              className="h-28 flex-col gap-3 border-white/10 hover:border-primary hover:bg-white/5 group"
              onClick={() => toast.success(`${action.label} opened`)}
            >
              <div className={`${action.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition`}>
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium text-white">{action.label}</span>
            </Button>
          );
        })}
      </div>

      <Button className="w-full mt-6 h-12 text-sm font-semibold" style={{ background: 'linear-gradient(135deg, var(--primary), #3b82f6)' }}>
        Record Expense
      </Button>
    </div>
  );
}