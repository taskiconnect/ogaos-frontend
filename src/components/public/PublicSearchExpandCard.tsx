'use client'

import { Compass, ArrowRight, Loader2 } from 'lucide-react'

interface PublicSearchExpandCardProps {
  radiusKM: number
  suggestedRadiusKM?: number
  onExpand: () => void
  loading?: boolean
}

export default function PublicSearchExpandCard({
  radiusKM,
  suggestedRadiusKM,
  onExpand,
  loading = false,
}: PublicSearchExpandCardProps) {
  if (!suggestedRadiusKM) return null

  return (
    <div
      className="relative overflow-hidden rounded-3xl p-6"
      style={{
        background: 'linear-gradient(135deg, rgba(251,191,36,0.08) 0%, rgba(245,158,11,0.05) 100%)',
        border: '1px solid rgba(251,191,36,0.20)',
      }}
    >
      {/* Decorative glows */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }} aria-hidden />
      <div className="pointer-events-none absolute -bottom-8 -left-8 h-28 w-28 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #d97706 0%, transparent 70%)' }} aria-hidden />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
            style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.20)' }}
          >
            <Compass className="h-5 w-5" style={{ color: '#fbbf24' }} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-amber-300">
              No businesses found within {radiusKM} km
            </h3>
            <p className="mt-1 text-sm leading-relaxed" style={{ color: 'rgba(251,191,36,0.60)' }}>
              Expand to <span className="font-semibold text-amber-300">{suggestedRadiusKM} km</span> to discover more businesses nearby.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onExpand}
          disabled={loading}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #b45309 0%, #d97706 100%)', boxShadow: '0 6px 24px rgba(180,83,9,0.35)' }}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Expand search
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}