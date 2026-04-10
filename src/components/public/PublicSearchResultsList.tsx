import Link from 'next/link'
import { CheckCircle2, MapPin, SearchX, Store, ArrowUpRight } from 'lucide-react'
import type { PublicBusinessSearchItem } from '@/types/public'

interface PublicSearchResultsListProps {
  results: PublicBusinessSearchItem[]
}

export default function PublicSearchResultsList({ results }: PublicSearchResultsListProps) {
  if (!results.length) {
    return (
      <div
        className="rounded-3xl p-14 text-center"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div
          className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
        >
          <SearchX className="h-7 w-7" style={{ color: 'rgba(255,255,255,0.35)' }} />
        </div>
        <h3 className="text-lg font-bold text-white">No businesses found</h3>
        <p className="mt-2 max-w-xs mx-auto text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.38)' }}>
          Try expanding your search radius or use a different keyword or category.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {results.map((item, index) => (
        <Link
          key={item.id}
          href={`/public/${item.slug}`}
          className="group relative overflow-hidden rounded-3xl transition-all duration-300 hover:-translate-y-1"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(12px)',
            animationDelay: `${index * 40}ms`,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.07)'
            ;(e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(34,197,94,0.25)'
            ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(34,197,94,0.15)'
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.04)'
            ;(e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.08)'
            ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = ''
          }}
        >
          {/* Top accent line on hover */}
          <div
            className="absolute inset-x-0 top-0 h-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{ background: 'linear-gradient(90deg, transparent, #22c55e, #1C35EA, transparent)' }}
          />

          <div className="p-5">
            <div className="flex items-start gap-4">
              {/* Logo */}
              <div
                className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.10)' }}
              >
                {item.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.logo_url} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                  <Store className="h-6 w-6" style={{ color: 'rgba(255,255,255,0.35)' }} />
                )}
              </div>

              <div className="min-w-0 flex-1">
                {/* Name row */}
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    <h3 className="truncate text-base font-bold text-white transition-colors duration-200 group-hover:text-green-400">
                      {item.name}
                    </h3>
                    {item.is_verified && (
                      <span
                        className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                        style={{ background: 'rgba(34,197,94,0.12)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.20)' }}
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        Verified
                      </span>
                    )}
                  </div>
                  {/* Arrow icon */}
                  <ArrowUpRight
                    className="h-4 w-4 shrink-0 opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    style={{ color: '#4ade80' }}
                  />
                </div>

                {/* Category */}
                <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {item.category}
                </p>

                {/* Description */}
                {item.description && (
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.50)' }}>
                    {item.description}
                  </p>
                )}
              </div>
            </div>

            {/* Footer row */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {item.city_town}, {item.local_government}, {item.state}
              </span>
              <span
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold"
                style={{ background: 'rgba(34,197,94,0.10)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.18)' }}
              >
                {item.distance_km.toFixed(1)} km away
              </span>
            </div>

            {/* Keywords */}
            {item.keywords.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {item.keywords.slice(0, 5).map((keyword) => (
                  <span
                    key={keyword}
                    className="rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.45)' }}
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
}