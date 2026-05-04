'use client'

import Image from 'next/image'
import Link from 'next/link'
import {
  Download,
  Package,
  BriefcaseBusiness,
  Star,
  ArrowRight,
} from 'lucide-react'
import { formatBytes, formatCurrency } from '@/types/public'

interface Props {
  id: string
  name: string
  price: number
  currency?: string
  image: string | null
  type: string
  description?: string | null
  salesCount?: number
  fileSize?: number | null
  slug?: string
  itemKind: 'digital' | 'physical' | 'service'
  inStock?: boolean
  bizSlug: string
}

const TYPE_COLORS: Record<string, string> = {
  download: 'border-blue-500/20 bg-blue-500/15 text-blue-400',
  course: 'border-purple-500/20 bg-purple-500/15 text-purple-400',
  video: 'border-red-500/20 bg-red-500/15 text-red-400',
  service: 'border-emerald-500/20 bg-emerald-500/15 text-emerald-400',
  product: 'border-amber-500/20 bg-amber-500/15 text-amber-400',
}

export function ProductCard({
  id,
  name,
  price,
  currency = 'NGN',
  image,
  type,
  description,
  salesCount,
  fileSize,
  itemKind,
  inStock = true,
  bizSlug,
}: Props) {
  return (
    <Link
      href={`/public/${bizSlug}/product/${id}`}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/6 bg-[#0e0e1a] transition-all duration-300 hover:border-brand-blue/40 hover:shadow-[0_8px_32px_rgba(28,53,234,0.12)]"
    >
      <div className="relative h-44 shrink-0 overflow-hidden bg-[#141420]">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            {itemKind === 'digital' ? (
              <Download className="h-10 w-10 text-white/10" />
            ) : itemKind === 'service' ? (
              <BriefcaseBusiness className="h-10 w-10 text-white/10" />
            ) : (
              <Package className="h-10 w-10 text-white/10" />
            )}
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

        <span
          className={`absolute left-2.5 top-2.5 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${
            TYPE_COLORS[type] ?? 'border-gray-500/20 bg-gray-500/15 text-gray-400'
          }`}
        >
          {type}
        </span>

        {(salesCount ?? 0) > 0 && (
          <span className="absolute bottom-2.5 left-2.5 flex items-center gap-0.5 rounded-full bg-amber-400/90 px-2 py-0.5 text-[10px] font-bold text-amber-900">
            <Star className="h-3 w-3 fill-current" />
            {salesCount} sold
          </span>
        )}

        {fileSize ? (
          <span className="absolute bottom-2.5 right-2.5 flex items-center gap-0.5 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-gray-300">
            <Download className="h-2.5 w-2.5" />
            {formatBytes(fileSize)}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <p className="line-clamp-2 text-sm font-semibold leading-snug text-white transition-colors group-hover:text-[#5b76ff]">
          {name}
        </p>

        {description ? <p className="line-clamp-2 text-xs text-gray-400">{description}</p> : null}

        {itemKind !== 'digital' && !inStock ? (
          <span className="mt-1 inline-flex w-fit rounded-full border border-red-500/20 bg-red-500/10 px-2 py-1 text-[10px] font-bold uppercase text-red-400">
            Out of stock
          </span>
        ) : null}

        <div className="mt-auto flex items-center justify-between pt-2">
          <p className="text-lg font-black text-white">{formatCurrency(price, currency)}</p>

          <span className="flex items-center gap-1.5 rounded-xl border border-brand-blue/50 bg-brand-blue/10 px-3 py-2 text-xs font-bold text-brand-blue transition-all group-hover:bg-brand-blue group-hover:text-white">
            View
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}