// components/dashboard/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CreditCard, AlertTriangle, Users, Wallet, UserCheck, Settings, LogOut, Menu } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/ledger', label: 'Smart Ledger', icon: CreditCard },
  { href: '/debts', label: 'Debts & Reminders', icon: AlertTriangle },
  { href: '/staff', label: 'Staff Manager', icon: Users },
  { href: '/payments', label: 'Payments', icon: Wallet },
  { href: '/identity', label: 'Professional Identity', icon: UserCheck },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore(); // logout can be added to store if needed

  return (
    <div className="w-72 border-r border-white/10 bg-[rgba(255,255,255,0.015)] backdrop-blur-2xl flex flex-col h-screen fixed left-0 top-0 z-50 hidden lg:flex">
      {/* Logo */}
      <div className="p-8 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div 
            className="w-9 h-9 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(0,43,157,0.15)', border: '1px solid rgba(0,43,157,0.3)' }}
          >
            <span className="text-2xl font-black text-primary tracking-tighter">O</span>
          </div>
          <div className="leading-none">
            <div className="font-bold text-2xl tracking-[-0.02em] text-white">OgaOS</div>
            <div className="text-[10px] text-gray-500 -mt-0.5">TaskiConnect</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3.5 px-5 py-3.5 rounded-2xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-white/10 text-white shadow-inner'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Plan & Logout */}
      <div className="p-6 border-t border-white/10 mt-auto">
        <div className="rounded-2xl bg-white/5 p-5 text-xs border border-white/10">
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-400">Starter Plan</span>
            <span className="px-2.5 py-0.5 bg-primary/20 text-primary text-[10px] rounded font-medium">Active</span>
          </div>
          <div className="font-semibold text-white">₦1,200 / month</div>
          <div className="text-gray-500 text-xs mt-0.5">2 staff • 4 modules</div>
          <Button size="sm" variant="outline" className="mt-4 w-full text-xs border-white/20 hover:bg-white/10">
            Upgrade to Pro
          </Button>
        </div>

        <button
          onClick={() => {
            logout?.();
            // router.push('/auth/login') if needed
          }}
          className="mt-6 flex w-full items-center justify-center gap-2 py-3 text-sm text-red-400/90 hover:text-red-400 hover:bg-white/5 rounded-xl transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}