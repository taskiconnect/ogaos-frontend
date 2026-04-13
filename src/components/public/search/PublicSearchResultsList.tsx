import Link from 'next/link'
import { CheckCircle2, MapPin, SearchX, Store, ArrowUpRight, Tag, Navigation } from 'lucide-react'
import type { PublicBusinessSearchItem } from '@/types/public'

interface PublicSearchResultsListProps {
  results: PublicBusinessSearchItem[]
  showDistance?: boolean
}

export default function PublicSearchResultsList({
  results,
  showDistance = true,
}: PublicSearchResultsListProps) {
  if (!results.length) {
    return (
      <div className="rounded-2xl border border-white/8 bg-white/2 p-14 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/8 bg-white/4">
          <SearchX className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-base font-semibold text-foreground">No businesses found</h3>
        <p className="mt-2 mx-auto max-w-xs text-sm leading-relaxed text-muted-foreground">
          Try a different keyword or category, or expand your search radius.
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
          className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/8 bg-white/2.5 p-5 transition-all duration-200 hover:border-primary/25 hover:bg-white/[0.045] hover:shadow-lg hover:shadow-black/20"
        >
          <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

          <div className="relative flex items-start gap-4">
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-sm">
              {item.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.logo_url} alt={item.name} className="h-full w-full object-cover" />
              ) : (
                <Store className="h-6 w-6 text-muted-foreground/60" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <h3 className="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                    {item.name}
                  </h3>

                  {item.is_verified && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                      <CheckCircle2 className="h-2.5 w-2.5" />
                      Verified
                    </span>
                  )}
                </div>

                <ArrowUpRight className="h-4 w-4 shrink-0 text-primary opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
              </div>

              <div className="mt-1 flex items-center gap-1.5">
                <Tag className="h-3 w-3 text-muted-foreground/50" />
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/60">
                  {item.category}
                </p>
              </div>

              {item.description && (
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              )}
            </div>
          </div>

          <div className="relative mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/6 pt-3">
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
              {item.city_town}, {item.local_government}, {item.state}
            </span>

            {showDistance && item.distance_km > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">
                <Navigation className="h-3 w-3" />
                {item.distance_km.toFixed(1)} km away
              </span>
            ) : showDistance && item.distance_km === 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">
                <Navigation className="h-3 w-3" />
                Near you
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-bold text-muted-foreground">
                Public business
              </span>
            )}
          </div>

          {item.keywords.length > 0 && (
            <div className="relative mt-3 flex flex-wrap gap-1.5">
              {item.keywords.slice(0, 5).map((keyword) => (
                <span
                  key={keyword}
                  className="rounded-full border border-white/8 bg-white/[0.04] px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground/70"
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