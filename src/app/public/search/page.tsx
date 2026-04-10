'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { MapPin, Search, SlidersHorizontal, ArrowLeft } from 'lucide-react'
import { searchPublicBusinesses } from '@/lib/api/public'
import type { PublicBusinessSearchResponse } from '@/types/public'
import PublicSearchResultsList from '@/components/public/PublicSearchResultsList'
import PublicSearchExpandCard from '@/components/public/PublicSearchExpandCard'
import { LandingHeader } from '@/components/shared/LandingHeader'
import { Footer } from '@/components/shared/Footer'

export default function PublicSearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const query  = searchParams.get('q') ?? ''
  const state  = searchParams.get('state') ?? ''
  const lga    = searchParams.get('lga') ?? ''
  const radius = Number(searchParams.get('radius_km') ?? '10')

  const [data, setData]                   = useState<PublicBusinessSearchResponse | null>(null)
  const [loading, setLoading]             = useState(true)
  const [expandLoading, setExpandLoading] = useState(false)
  const [error, setError]                 = useState<string | null>(null)

  const pageTitle = useMemo(() => {
    if (query.trim()) return `"${query}"`
    return 'Nearby businesses'
  }, [query])

  useEffect(() => {
    let active = true
    async function run() {
      if (!state || !lga) {
        setError('Missing location. Please choose a state and LGA.')
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        setError(null)
        const result = await searchPublicBusinesses({ q: query, state, lga, radius_km: radius || 10 })
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
    return () => { active = false }
  }, [query, state, lga, radius])

  async function handleExpandSearch() {
    if (!data?.meta.suggested_expanded_radius_km) return
    setExpandLoading(true)
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    params.set('state', state)
    params.set('lga', lga)
    params.set('radius_km', String(data.meta.suggested_expanded_radius_km))
    router.push(`/public/search?${params.toString()}`)
  }

  const totalCount = data?.meta.total ?? 0

  return (
    <div className="relative min-h-screen flex flex-col bg-background text-foreground">

      {/* ── Navbar ── */}
      <LandingHeader />

      {/* ── Hero band ── */}
      <div className="border-b border-white/8">
        <div className="mx-auto max-w-7xl px-6 pt-32 pb-12 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">

            {/* Back button + heading */}
            <div className="flex items-start gap-4">
              <button
                onClick={() => router.back()}
                className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-white/2 transition-all duration-150 hover:bg-white/4 active:scale-95"
                aria-label="Go back"
              >
                <ArrowLeft className="h-4 w-4 text-muted-foreground" />
              </button>

              <div>
                <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
                  <Search className="h-3 w-3" />
                  Business discovery
                </span>

                <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                  {query.trim() ? (
                    <>
                      Results for{' '}
                      <span className="text-primary">{pageTitle}</span>
                    </>
                  ) : 'Nearby businesses'}
                </h1>

                <p className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {lga}, {state}
                  </span>
                  <span className="text-muted-foreground/40">·</span>
                  <span>{radius} km radius</span>
                </p>
              </div>
            </div>

            {/* Result count */}
            {loading ? (
              <div className="h-16 w-40 animate-pulse rounded-2xl border border-white/8 bg-white/2" />
            ) : (
              <div className="inline-flex flex-col items-end rounded-2xl border border-white/8 bg-white/2 px-5 py-3">
                <span className={`text-2xl font-bold ${totalCount > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                  {totalCount}
                </span>
                <span className="text-xs text-muted-foreground">
                  {totalCount === 1 ? 'business' : 'businesses'} found
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Results body ── */}
      <div className="flex-1 mx-auto w-full max-w-7xl px-6 py-10 sm:px-8 lg:px-10">

        {/* Sort chip */}
        {!loading && !error && totalCount > 0 && (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{totalCount}</span>{' '}
              {totalCount === 1 ? 'result' : 'results'}
            </p>
            <div className="inline-flex items-center gap-2 rounded-xl border border-white/8 bg-white/2 px-3.5 py-2 text-xs font-medium text-muted-foreground">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Sorted by distance
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-44 animate-pulse rounded-2xl border border-white/8 bg-white/2"
                style={{ animationDelay: `${i * 70}ms` }}
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-10 text-center">
            <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-destructive/20 bg-destructive/10">
              <Search className="h-5 w-5 text-destructive" />
            </div>
            <p className="text-sm font-semibold text-destructive">{error}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <PublicSearchExpandCard
              radiusKM={data?.meta.radius_km ?? radius}
              suggestedRadiusKM={data?.meta.suggested_expanded_radius_km}
              onExpand={handleExpandSearch}
              loading={expandLoading}
            />
            <PublicSearchResultsList results={data?.results ?? []} />
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <Footer />
    </div>
  )
}