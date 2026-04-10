import Link from 'next/link'
import { CheckCircle2, MapPin, SearchX, Store, ArrowUpRight } from 'lucide-react'
import type { PublicBusinessSearchItem } from '@/types/public'

interface PublicSearchResultsListProps {
  results: PublicBusinessSearchItem[]
}

export default function PublicSearchResultsList({ results }: PublicSearchResultsListProps) {
  if (!results.length) {
    return (
      <div className="rounded-2xl border border-white/8 bg-white/2 p-14 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/8 bg-white/4">
          <SearchX className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-base font-semibold text-foreground">No businesses found</h3>
        <p className="mt-2 mx-auto max-w-xs text-sm leading-relaxed text-muted-foreground">
          Try expanding your search radius or use a different keyword or category.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      {results.map((item) => (
        <Link
          key={item.id}
          href={`/public/${item.slug}`}
          className="group relative overflow-hidden rounded-2xl border border-white/8 bg-white/2 p-5 transition-all duration-200 hover:bg-white/4 hover:border-primary/20"
        >
          <div className="flex items-start gap-4">
            {/* Logo */}
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/8 bg-white/4">
              {item.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.logo_url} alt={item.name} className="h-full w-full object-cover" />
              ) : (
                <Store className="h-5 w-5 text-muted-foreground" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              {/* Name row */}
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2 min-w-0">
                  <h3 className="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                    {item.name}
                  </h3>
                  {item.is_verified && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                      <CheckCircle2 className="h-3 w-3" />
                      Verified
                    </span>
                  )}
                </div>
                <ArrowUpRight
                  className="h-4 w-4 shrink-0 text-primary opacity-0 transition-all duration-200 group-hover:opacity-100"
                />
              </div>

              {/* Category */}
              <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/60">
                {item.category}
              </p>

              {/* Description */}
              {item.description && (
                <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              )}
            </div>
          </div>

          {/* Footer row */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {item.city_town}, {item.local_government}, {item.state}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-1 text-[11px] font-bold text-primary">
              {item.distance_km.toFixed(1)} km away
            </span>
          </div>

          {/* Keywords */}
          {item.keywords.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {item.keywords.slice(0, 5).map((keyword) => (
                <span
                  key={keyword}
                  className="rounded-full border border-white/8 bg-white/4 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground"
                >
                  {keyword}
                </span>
              ))}
            </div>
          )}
        </Link>
      ))}
    </div>
  )
}