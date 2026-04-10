'use client'

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
        <div className="relative aspect-video w-full max-h-[75vh] overflow-hidden rounded-2xl bg-black">
          <Image
            src={images[active]}
            alt=""
            fill
            className="object-contain"
            sizes="(max-width: 896px) 100vw, 896px"
            unoptimized
          />
        </div>

        {images.length > 1 && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {images.map((url, i) => (
              <button
                key={`${url}-${i}`}
                onClick={() => setActive(i)}
                className="relative h-14 w-14 shrink-0"
              >
                <Image
                  src={url}
                  alt=""
                  fill
                  className={`rounded-xl border-2 object-cover transition-all ${
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