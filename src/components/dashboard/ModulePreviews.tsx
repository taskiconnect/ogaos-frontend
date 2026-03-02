'use client';

import { Button } from '@/components/ui/button';
import { ShieldCheck, MapPin, FileText, Zap } from 'lucide-react';

const modules = [
  { title: 'Professional Identity', icon: ShieldCheck, desc: 'Branded invoices, digital card & verified badge', href: '/identity' },
  { title: 'Local Directory', icon: MapPin, desc: 'Get discovered by customers nearby', href: '/directory' },
  { title: 'Hire-Right', icon: FileText, desc: 'Post jobs & find reliable staff', href: '/hire' },
  { title: 'Energy & Expenses', icon: Zap, desc: 'Generator, fuel & rent tracker', href: '/expenses' },
];

export default function ModulePreviews() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {modules.map((m) => {
        const Icon = m.icon;
        return (
          <a
            key={m.title}
            href={m.href}
            className="group bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-3xl p-8 hover:border-primary/50 transition-all hover:-translate-y-1"
          >
            <Icon className="w-9 h-9 text-primary mb-6" />
            <div className="font-semibold text-lg mb-2">{m.title}</div>
            <div className="text-sm text-gray-400 leading-snug">{m.desc}</div>
            <div className="text-xs text-primary mt-6 group-hover:underline">Open module →</div>
          </a>
        );
      })}
    </div>
  );
}