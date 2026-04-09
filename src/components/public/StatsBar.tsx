import { ShoppingBag, Download, Eye, Calendar } from 'lucide-react'
import type {
  PublicBusiness,
  DigitalProduct,
  PhysicalProduct,
} from '@/components/public/public-profile-shared'
import { yearSince } from '@/components/public/public-profile-shared'

interface Props {
  biz: PublicBusiness
  digital: DigitalProduct[]
  physical: PhysicalProduct[]
}

export function StatsBar({ biz, digital, physical }: Props) {
  const stats = [
    {
      icon: ShoppingBag,
      label: 'Total Products',
      value: (digital.length + physical.length).toString(),
      color: 'text-[#5b76ff]',
      bg: 'bg-brand-blue/10',
      border: 'border-brand-blue/20',
    },
    {
      icon: Download,
      label: 'Digital Items',
      value: digital.length.toString(),
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
      border: 'border-amber-400/20',
    },
    {
      icon: Eye,
      label: 'Profile Views',
      value:
        biz.profile_views > 999
          ? `${(biz.profile_views / 1000).toFixed(1)}k`
          : biz.profile_views.toString(),
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
      border: 'border-purple-400/20',
    },
    {
      icon: Calendar,
      label: 'Member Since',
      value: biz.created_at ? yearSince(biz.created_at).toString() : '—',
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
      border: 'border-emerald-400/20',
    },
  ]

  return (
    <div className="my-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map(({ icon: Icon, label, value, color, bg, border }) => (
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