'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Heart,
  Plus,
  CheckCircle2,
  Download,
  Package,
  Star,
} from 'lucide-react'
import type { CartItem } from '@/components/public/public-profile-shared'
import { fmt, fmtSize } from '@/components/public/public-profile-shared'

interface Props {
  id: string
  name: string
  price: number
  image: string | null
  type: string
  description?: string | null
  salesCount?: number
  fileSize?: number | null
  slug?: string
  bizSlug: string
  onAddToCart: (item: CartItem) => void
  isDigital: boolean
}

const TYPE_COLORS: Record<string, string> = {
  download: 'border-blue-500/20 bg-blue-500/15 text-blue-400',
  course: 'border-purple-500/20 bg-purple-500/15 text-purple-400',
  video: 'border-red-500/20 bg-red-500/15 text-red-400',
  service: 'border-emerald-500/20 bg-emerald-500/15 text-emerald-400',
}

export function ProductCard({
  id,
  name,
  price,
  image,
  type,
  description,
  salesCount,
  fileSize,
  slug: productSlug,
  bizSlug,
  onAddToCart,
  isDigital,
}: Props) {
  const [wishlisted, setWishlisted] = useState(false)
  const [added, setAdded] = useState(false)

  function addToCart(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    onAddToCart({
      id,
      name,
      price,
      qty: 1,
      image,
      type: isDigital ? 'digital' : 'physical',
      slug: productSlug,
    })

    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const card = (
    <div className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/6 bg-[#0e0e1a] transition-all duration-300 hover:border-brand-blue/40 hover:shadow-[0_8px_32px_rgba(28,53,234,0.12)]">
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
            {isDigital ? (
              <Download className="h-10 w-10 text-white/10" />
            ) : (
              <Package className="h-10 w-10 text-white/10" />
            )}
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setWishlisted((w) => !w)
          }}
          className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 opacity-0 backdrop-blur transition-all hover:scale-110 group-hover:opacity-100"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              wishlisted ? 'fill-red-400 text-red-400' : 'text-white'
            }`}
          />
        </button>

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

        {fileSize && (
          <span className="absolute bottom-2.5 right-2.5 flex items-center gap-0.5 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-gray-300">
            <Download className="h-2.5 w-2.5" />
            {fmtSize(fileSize)}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <p className="line-clamp-2 text-sm font-semibold leading-snug text-white transition-colors group-hover:text-[#5b76ff]">
          {name}
        </p>

        {description && <p className="line-clamp-1 text-xs text-gray-600">{description}</p>}

        <div className="mt-auto flex items-center justify-between pt-2">
          <p className="text-lg font-black text-white">{fmt(price)}</p>

          <button
            onClick={addToCart}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-all ${
              added
                ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-400'
                : 'border-brand-blue/50 bg-brand-blue text-white hover:bg-[#1528d4]'
            }`}
          >
            {added ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                Added
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" />
                Add
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )

  if (isDigital && productSlug) {
    return <Link href={`/public/${bizSlug}/product/${productSlug}`}>{card}</Link>
  }

  return card
}