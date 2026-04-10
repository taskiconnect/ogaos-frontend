'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { MapPin, Search, SlidersHorizontal, ArrowLeft, Sparkles } from 'lucide-react'
import { searchPublicBusinesses } from '@/lib/api/public'
import type { PublicBusinessSearchResponse } from '@/types/public'
import PublicSearchResultsList from '@/components/public/PublicSearchResultsList'
import PublicSearchExpandCard from '@/components/public/PublicSearchExpandCard'
import { LandingHeader } from '@/components/shared/LandingHeader'
import { Footer } from '@/components/shared/Footer'

export default function PublicSearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const query   = searchParams.get('q') ?? ''
  const state   = searchParams.get('state') ?? ''
  const lga     = searchParams.get('lga') ?? ''
  const radius  = Number(searchParams.get('radius_km') ?? '10')

  const [data, setData]               = useState<PublicBusinessSearchResponse | null>(null)
  const [loading, setLoading]         = useState(true)
  const [expandLoading, setExpandLoading] = useState(false)
  const [error, setError]             = useState<string | null>(null)

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
    <div
      className="relative min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(160deg, #07101e 0%, #0b1524 40%, #081509 100%)' }}
    >
      {/* ── Fixed ambient glows ── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-56 -right-56 h-[900px] w-[900px] rounded-full opacity-[0.15]"
          style={{ background: 'radial-gradient(circle, #22c55e 0%, transparent 60%)' }} />
        <div className="absolute top-1/3 -left-56 h-[700px] w-[700px] rounded-full opacity-[0.10]"
          style={{ background: 'radial-gradient(circle, #1C35EA 0%, transparent 60%)' }} />
        <div className="absolute -bottom-56 right-1/3 h-[600px] w-[600px] rounded-full opacity-[0.08]"
          style={{ background: 'radial-gradient(circle, #22c55e 0%, transparent 60%)' }} />
        {/* Grid texture */}
        <div className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
            backgroundSize: '72px 72px',
          }} />
      </div>

      {/* ── Navbar ── */}
      <div className="relative z-50">
        <LandingHeader />
      </div>

      {/* ── Hero band ── */}
      <div className="relative z-10 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        {/* Horizontal accent line at top of band */}
        <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(34,197,94,0.4), rgba(28,53,234,0.4), transparent)' }} />

        <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">

            {/* Back button + heading */}
            <div className="flex items-start gap-4">
              <button
                onClick={() => router.back()}
                className="mt-1.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
                aria-label="Go back"
              >
                <ArrowLeft className="h-4 w-4" style={{ color: 'rgba(255,255,255,0.65)' }} />
              </button>

              <div>
                <span
                  className="mb-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest"
                  style={{ background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.22)', color: '#4ade80' }}
                >
                  <Search className="h-3 w-3" />
                  Business discovery
                </span>

                <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                  {query.trim() ? (
                    <>
                      Results for{' '}
                      <span style={{
                        background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}>
                        {pageTitle}
                      </span>
                    </>
                  ) : 'Nearby businesses'}
                </h1>

                <p className="mt-2 flex flex-wrap items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.40)' }}>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {lga}, {state}
                  </span>
                  <span className="opacity-40">·</span>
                  <span>{radius} km radius</span>
                </p>
              </div>
            </div>

            {/* Result count */}
            <div>
              {loading ? (
                <div className="h-12 w-44 animate-pulse rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)' }} />
              ) : (
                <div
                  className="inline-flex flex-col items-end rounded-2xl px-5 py-3"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <span className="text-2xl font-black" style={{ color: totalCount > 0 ? '#4ade80' : 'rgba(255,255,255,0.35)' }}>
                    {totalCount}
                  </span>
                  <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.38)' }}>
                    {totalCount === 1 ? 'business' : 'businesses'} found
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Results body ── */}
      <div className="relative z-10 flex-1 mx-auto w-full max-w-7xl px-6 py-10 sm:px-8 lg:px-10">

        {/* Sort chip */}
        {!loading && !error && totalCount > 0 && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.38)' }}>
              Showing <span className="font-bold text-white">{totalCount}</span> {totalCount === 1 ? 'result' : 'results'}
            </p>
            <div
              className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.40)' }}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Sorted by distance
            </div>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-48 animate-pulse rounded-3xl"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', animationDelay: `${i * 70}ms` }}
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-3xl p-12 text-center" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.16)' }}>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: 'rgba(239,68,68,0.12)' }}>
              <Search className="h-5 w-5 text-red-400" />
            </div>
            <p className="text-sm font-semibold text-red-400">{error}</p>
          </div>
        ) : (
          <div className="space-y-5">
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
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  )
}