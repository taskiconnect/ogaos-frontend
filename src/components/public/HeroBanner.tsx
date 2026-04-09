import Image from 'next/image'
import { BadgeCheck, MapPin, Calendar, Eye, Tag } from 'lucide-react'
import type { PublicBusiness } from '@/components/public/public-profile-shared'
import { yearSince } from '@/components/public/public-profile-shared'

const BANNER_URL =
  'https://ik.imagekit.io/jwrqb9lqx/TaskiConnect%20Website/i%20love%20taking%20pictures%20of%20textures%20and%20turning%20them%20into%20cool%20backgrounds___.jpg?updatedAt=1775669147999'

interface Props {
  biz: PublicBusiness
  accent: string
}

export function HeroBanner({ biz, accent }: Props) {
  const initials = biz.name
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const shortAddr = [biz.city_town, biz.state].filter(Boolean).join(', ')

  return (
    <section className="relative h-72 overflow-hidden sm:h-[420px] lg:h-[480px]">
      <Image
        src={BANNER_URL}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
        quality={85}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/85" />

      <div
        className="absolute inset-0 opacity-25"
        style={{ background: `linear-gradient(135deg, ${accent}55, transparent 65%)` }}
      />

      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.15'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
        }}
      />

      <div className="absolute left-4 top-4 z-10 flex gap-2 sm:left-6">
        <span className="flex items-center gap-1.5 rounded-full border border-white/15 bg-black/55 px-3 py-1.5 text-[11px] font-bold text-white/85 backdrop-blur-md">
          <Tag className="h-3 w-3" />
          {biz.category}
        </span>

        {biz.status === 'active' && (
          <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/35 bg-emerald-500/20 px-3 py-1.5 text-[11px] font-bold text-emerald-300 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Active
          </span>
        )}
      </div>

      {biz.profile_views > 0 && (
        <div className="absolute right-4 top-4 z-10 flex items-center gap-1.5 rounded-full border border-white/10 bg-black/55 px-3 py-1.5 text-[11px] font-semibold text-gray-300 backdrop-blur-md sm:right-6">
          <Eye className="h-3 w-3" />
          {biz.profile_views.toLocaleString()} views
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 z-0 flex select-none items-center justify-center">
        <p className="px-4 text-center text-7xl font-black uppercase leading-none tracking-tighter text-white/[0.035] sm:text-[9rem]">
          {biz.name}
        </p>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 px-4 pb-6 sm:px-6 sm:pb-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div
              className="h-24 w-24 shrink-0 overflow-hidden rounded-3xl border-[3px] border-[#080810] bg-[#141420] shadow-2xl sm:h-28 sm:w-28"
              style={{ boxShadow: `0 0 0 1px rgba(255,255,255,0.07), 0 24px 64px rgba(0,0,0,0.7)` }}
            >
              {biz.logo_url ? (
                <Image
                  src={biz.logo_url}
                  alt={biz.name}
                  width={112}
                  height={112}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center text-3xl font-black text-white"
                  style={{ background: `linear-gradient(135deg, ${accent}cc, #0c0c20)` }}
                >
                  {initials}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1 sm:pb-2">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h1
                  className="text-3xl font-black leading-none tracking-tight text-white sm:text-4xl lg:text-5xl"
                  style={{ textShadow: `0 2px 24px rgba(0,0,0,0.8), 0 0 60px ${accent}44` }}
                >
                  {biz.name}
                </h1>

                {biz.is_verified && (
                  <span
                    className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold"
                    style={{
                      background: `${accent}22`,
                      borderColor: `${accent}40`,
                      color: '#7a8fff',
                    }}
                  >
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Verified
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-gray-300/90">
                {shortAddr && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 shrink-0" style={{ color: accent }} />
                    {shortAddr}
                  </span>
                )}

                {biz.created_at && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                    Since {yearSince(biz.created_at)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}