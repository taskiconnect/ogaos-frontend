import type { PublicBusiness } from '@/types/public'
import { BadgeCheck, MapPin } from 'lucide-react'
import Image from 'next/image'

interface Props {
  biz: PublicBusiness
  accent: string
}

/** Compact, solid-colour banner compatible with the existing profile page. */
export function HeroBanner({ biz }: Props) {
  const initials =
    biz.name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => Array.from(word)[0])
      .join('')
      .toUpperCase() || 'B'
  const location = [biz.city_town, biz.state].filter(Boolean).join(', ')

  return (
    <section
      aria-labelledby="business-profile-title"
      className="border-b border-white/10 bg-[#142850] text-white"
    >
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-6 sm:gap-5 sm:px-6 sm:py-7">
        <div className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-white text-lg font-bold text-[#142850] sm:size-16">
          {biz.logo_url ? (
            <Image
              src={biz.logo_url}
              alt={`${biz.name} logo`}
              width={64}
              height={64}
              className="size-full object-contain p-1.5"
              unoptimized
            />
          ) : (
            <span aria-hidden="true">{initials}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h1
              id="business-profile-title"
              className="text-xl font-semibold leading-tight tracking-tight [overflow-wrap:anywhere] sm:text-3xl"
            >
              {biz.name}
            </h1>
            {biz.is_verified && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-200">
                <BadgeCheck className="size-4" aria-hidden="true" /> Verified
              </span>
            )}
          </div>
          {biz.category && (
            <p className="mt-1 break-words text-xs text-slate-200 sm:text-sm">{biz.category}</p>
          )}
          {location && (
            <p className="mt-1.5 flex items-start gap-1.5 text-xs leading-5 text-slate-300">
              <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              <span className="break-words">{location}</span>
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
