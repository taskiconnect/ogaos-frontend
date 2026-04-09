'use client'
// src/app/public/[slug]/profile/components/Lightbox.tsx
// ✅ CLIENT COMPONENT

import { useState } from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'

interface Props {
  images: string[]
  idx: number
  onClose: () => void
}

export function Lightbox({ images, idx, onClose }: Props) {
  const [active, setActive] = useState(idx)

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors z-10"
      >
        <X className="w-5 h-5" />
      </button>

      <div
        className="max-w-4xl w-full"
        onClick={e => e.stopPropagation()}
      >
        {/* Main image */}
        <div className="relative w-full max-h-[75vh] aspect-video rounded-2xl overflow-hidden bg-black">
          <Image
            src={images[active]}
            alt=""
            fill
            className="object-contain"
            sizes="(max-width: 896px) 100vw, 896px"
            unoptimized
          />
        </div>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="flex justify-center gap-2 mt-4 flex-wrap">
            {images.map((u, i) => (
              <button key={u} onClick={() => setActive(i)} className="relative w-14 h-14 shrink-0">
                <Image
                  src={u}
                  alt=""
                  fill
                  className={`object-cover rounded-xl border-2 transition-all ${
                    i === active
                      ? 'border-[#1C35EA] opacity-100'
                      : 'border-white/10 opacity-40 hover:opacity-70'
                  }`}
                  sizes="56px"
                  unoptimized
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}