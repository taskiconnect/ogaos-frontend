import { ShoppingBag, BriefcaseBusiness, Download, Eye } from 'lucide-react'
import type { PublicBusiness, PublicStats } from '@/types/public'

interface Props {
  business: PublicBusiness
  stats: PublicStats
}

export function StatsBar({ business, stats }: Props) {
  const items = [
    {
      icon: ShoppingBag,
      label: 'Products',
      value: String(stats.total_products),
      color: 'text-[#5b76ff]',
      bg: 'bg-brand-blue/10',
      border: 'border-brand-blue/20',
    },
    {
      icon: BriefcaseBusiness,
      label: 'Services',
      value: String(stats.total_services),
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
      border: 'border-emerald-400/20',
    },
    {
      icon: Download,
      label: 'Digital Items',
      value: String(stats.total_digital_products),
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
      border: 'border-amber-400/20',
    },
    {
      icon: Eye,
      label: 'Profile Views',
      value:
        business.profile_views > 999
          ? `${(business.profile_views / 1000).toFixed(1)}k`
          : String(business.profile_views),
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
      border: 'border-purple-400/20',
    },
  ]

  return (
    <div id="overview" className="my-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map(({ icon: Icon, label, value, color, bg, border }) => (
        <div
          key={label}
          className={`${bg} ${border} flex items-center gap-3 rounded-2xl border p-4`}
        >
          <div
            className={`${bg} ${border} flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border`}
          >
            <Icon className={`h-4 w-4 ${color}`} />
          </div>

          <div>
            <p className="text-xl font-black leading-none text-white">{value}</p>
            <p className="mt-0.5 text-xs text-gray-500">{label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}