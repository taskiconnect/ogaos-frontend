// components/dashboard/OutstandingDebts.tsx
'use client';

import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { WhatsApp, AlertCircle } from 'lucide-react'; // or use MessageCircle

const mockDebts = [
  { id: 1, customer: 'Mama Ngozi Provisions', amount: 42500, due: '2 days', phone: '08031234567' },
  { id: 2, customer: 'Chukwudi Electricals', amount: 18500, due: '5 days', phone: '09087654321' },
  { id: 3, customer: 'Aisha Fashion Store', amount: 67000, due: 'Today', phone: '08123456789' },
];

export default function OutstandingDebts() {
  const sendReminder = (debt: any) => {
    toast.success(`WhatsApp reminder sent to ${debt.customer}`);
    // In real app: call API with debt.phone + template
  };

  return (
    <div className="bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-3xl p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400" />
          <div>
            <div className="font-semibold">Outstanding Debts</div>
            <div className="text-xs text-gray-400">₦128,000 total • 3 customers</div>
          </div>
        </div>
        <Button variant="outline" size="sm" className="border-white/20 text-xs">
          View all
        </Button>
      </div>

      <div className="space-y-4">
        {mockDebts.map((debt) => (
          <div key={debt.id} className="flex items-center justify-between bg-white/5 rounded-2xl p-5 group">
            <div>
              <div className="font-medium text-sm">{debt.customer}</div>
              <div className="text-xs text-gray-400">Due {debt.due}</div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-lg">₦{debt.amount.toLocaleString()}</div>
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-primary text-xs hover:bg-primary/10 mt-1"
                onClick={() => sendReminder(debt)}
              >
                Send WhatsApp Reminder
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}