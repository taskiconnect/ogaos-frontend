// components/dashboard/DashboardHeader.tsx
'use client';

import { Search, Bell, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function DashboardHeader() {
  const { user } = useAuthStore();

  return (
    <header className="h-20 border-b border-white/10 bg-[rgba(255,255,255,0.01)] backdrop-blur-xl px-8 flex items-center justify-between lg:pl-[288px] z-40">
      <div className="flex-1 max-w-md relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <Input
          placeholder="Search transactions, customers, debts..."
          className="pl-11 bg-white/5 border-white/10 h-11 text-sm placeholder-gray-500 focus:border-primary"
        />
      </div>

      <div className="flex items-center gap-6">
        {/* Notifications */}
        <div className="relative cursor-pointer">
          <Bell className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-bold">3</div>
        </div>

        {/* User */}
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="w-9 h-9 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center text-white font-semibold text-sm ring-2 ring-white/20">
            {user?.name ? user.name[0].toUpperCase() : 'O'}
          </div>
          <div className="hidden md:block">
            <div className="font-medium text-sm leading-none">Oga {user?.name?.split(' ')[0] || 'Chinedu'}</div>
            <div className="text-xs text-gray-500">Business Owner</div>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-white transition" />
        </div>
      </div>
    </header>
  );
}