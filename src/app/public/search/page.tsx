'use client'

import { useEffect, useMemo, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  MapPin,
  Search,
  SlidersHorizontal,
  ArrowLeft,
  Sparkles,
  Compass,
  Navigation,
  Loader2,
} from 'lucide-react'
import { searchPublicBusinesses } from '@/lib/api/public'
import type { PublicBusinessSearchResponse } from '@/types/public'
import PublicSearchResultsList from '@/components/public/search/PublicSearchResultsList'
import PublicSearchExpandCard from '@/components/public/search/PublicSearchExpandCard'
import { LandingHeader } from '@/components/shared/LandingHeader'
import { Footer } from '@/components/shared/Footer'

function SearchContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const query = searchParams.get('q') ?? ''
  const rawLat = searchParams.get('lat')
  const rawLng = searchParams.get('lng')
  const rawRadius = searchParams.get('radius_km')
  const locationDenied = searchParams.get('location_denied') === '1'

  const lat = rawLat ? Number(rawLat) : undefined
  const lng = rawLng ? Number(rawLng) : undefined
  const radius = rawRadius ? Number(rawRadius) : 10

  const hasCoordinates =
    typeof lat === 'number' &&
    !Number.isNaN(lat) &&
    typeof lng === 'number' &&
    !Number.isNaN(lng)

  const [data, setData] = useState<PublicBusinessSearchResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expanding, setExpanding] = useState(false)

  const pageTitle = useMemo(() => {
    if (query.trim()) return `"${query}"`
    return 'Businesses'
  }, [query])

  useEffect(() => {
    let active = true

    async function run() {
      try {
        setLoading(true)
        setError(null)

        const result = await searchPublicBusinesses({
          q: query,
          lat: hasCoordinates ? lat : undefined,
          lng: hasCoordinates ? lng : undefined,
          radius_km: hasCoordinates ? radius : undefined,
        })

        if (!active) return
        setData(result)
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Failed to search businesses')
      } finally {
        if (active) setLoading(false)
      }
    }

    void run()
    return () => {
      active = false
    }
  }, [query, hasCoordinates, lat, lng, radius])

  const totalCount = data?.meta.total ?? 0
  const usedCurrentLocation = data?.meta.used_current_location ?? hasCoordinates
  const deniedLocationMode = data?.meta.location_denied ?? locationDenied

  const suggestedRadiusKM = useMemo(() => {
    if (!radius) return 25
    return Math.min(Math.round(radius * 1.5), 50)
  }, [radius])

  const handleExpandSearch = async () => {
    setExpanding(true)
    const newRadius = suggestedRadiusKM
    const params = new URLSearchParams(searchParams.toString())
    params.set('radius_km', newRadius.toString())
    router.push(`/public/search?${params.toString()}`)
    setExpanding(false)
  }

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const params = new URLSearchParams(searchParams.toString())
        params.set('lat', latitude.toString())
        params.set('lng', longitude.toString())
        params.set('radius_km', '10')
        if (query) params.set('q', query)
        router.push(`/public/search?${params.toString()}`)
      },
      (err) => {
        console.error('Location error:', err)
        setError('Unable to get your location. Please check permissions.')
        setTimeout(() => setError(null), 3000)
      }
    )
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-background text-foreground">
      <LandingHeader />

      <div className="border-b border-white/8 bg-linear-to-b from-white/2.5 to-transparent">
        <div className="mx-auto max-w-7xl px-4 pt-28 pb-10 sm:px-6 lg:px-8">
          <button
            onClick={() => router.back()}
            className="mb-6 inline-flex items-center gap-2 rounded-xl border border-white/8 bg-white/2 px-3.5 py-2 text-xs font-medium text-muted-foreground transition-all duration-150 hover:bg-white/5 hover:text-foreground active:scale-95"
            aria-label="Go back"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
                <Search className="h-3 w-3" />
                Business discovery
              </span>

              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                {query.trim() ? (
                  <>
                    Results for <span className="text-primary">{pageTitle}</span>
                  </>
                ) : (
                  <>
                    Businesses <span className="text-primary">near you</span>
                  </>
                )}
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                {usedCurrentLocation ? (
                  <>
                    <span className="inline-flex items-center gap-1.5">
                      <Navigation className="h-3.5 w-3.5 text-primary/60" />
                      Using your current location
                    </span>
                    <span className="text-white/20">·</span>
                    <span>{radius} km radius</span>
                    <button
                      onClick={handleUseLocation}
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <Loader2 className="h-3 w-3" />
                      Update
                    </button>
                  </>
                ) : deniedLocationMode ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Compass className="h-3.5 w-3.5 text-primary/60" />
                    Showing all matching businesses (location access denied)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5">
                    <Search className="h-3.5 w-3.5 text-primary/60" />
                    Showing matching public businesses
                    <button
                      onClick={handleUseLocation}
                      className="ml-2 inline-flex items-center gap-1 rounded-lg border border-primary/20 bg-primary/5 px-2 py-1 text-xs text-primary hover:bg-primary/10"
                    >
                      <Navigation className="h-3 w-3" />
                      Use my location
                    </button>
                  </span>
                )}
              </div>
            </div>

            {loading ? (
              <div className="h-18 w-36 animate-pulse rounded-2xl border border-white/8 bg-white/2" />
            ) : (
              <div className="inline-flex flex-col items-center rounded-2xl border border-white/10 bg-white/3 px-6 py-3 text-center shadow-lg shadow-black/20">
                <span
                  className={`text-3xl font-extrabold tabular-nums ${
                    totalCount > 0 ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {totalCount}
                </span>
                <span className="mt-0.5 text-xs font-medium text-muted-foreground">
                  {totalCount === 1 ? 'business' : 'businesses'} found
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {!loading && !error && totalCount > 0 && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{totalCount}</span>{' '}
              {totalCount === 1 ? 'result' : 'results'}
            </p>

            <div className="inline-flex items-center gap-2 rounded-xl border border-white/8 bg-white/3 px-3.5 py-2 text-xs font-medium text-muted-foreground">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {usedCurrentLocation ? 'Sorted by distance' : 'Sorted by relevance'}
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-48 animate-pulse rounded-2xl border border-white/8 bg-white/2.5"
                style={{ animationDelay: `${i * 60}ms` }}
              />
            ))}
          </div>
        ) : error ? (
          <div className="mx-auto max-w-md rounded-2xl border border-destructive/20 bg-destructive/5 p-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/10">
              <Search className="h-5 w-5 text-destructive" />
            </div>
            <p className="text-sm font-semibold text-destructive">{error}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Please try your search again.
            </p>
          </div>
        ) : totalCount === 0 ? (
          <>
            {!usedCurrentLocation && (
              <div className="mx-auto max-w-md rounded-2xl border border-white/8 bg-white/2 p-14 text-center">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/8 bg-white/4">
                  <Sparkles className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-base font-semibold text-foreground">
                  No results found
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {query.trim()
                    ? `No businesses match "${query}".`
                    : 'Try a different keyword or category, or use your location for better results.'}
                </p>
                <button
                  onClick={handleUseLocation}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary/10 border border-primary/20 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20"
                >
                  <Navigation className="h-4 w-4" />
                  Use my location
                </button>
              </div>
            )}

            {usedCurrentLocation && (
              <div className="max-w-2xl mx-auto">
                <PublicSearchExpandCard
                  radiusKM={radius}
                  suggestedRadiusKM={suggestedRadiusKM}
                  onExpand={handleExpandSearch}
                  loading={expanding}
                />
              </div>
            )}
          </>
        ) : (
          <PublicSearchResultsList
            results={data?.results ?? []}
            showDistance={usedCurrentLocation}
          />
        )}
      </div>

      <Footer />
    </div>
  )
}

export default function PublicSearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}