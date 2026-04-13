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
    <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/8 via-amber-500/5 to-transparent p-5">
      {/* Subtle glow accent */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-amber-500/10 blur-2xl" />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/25 bg-amber-500/12">
            <Compass className="h-4.5 w-4.5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-amber-200">
              No businesses found within {radiusKM} km
            </h3>
            <p className="mt-0.5 text-sm text-amber-400/70">
              Expand to{' '}
              <span className="font-semibold text-amber-300">{suggestedRadiusKM} km</span>{' '}
              to discover more businesses nearby.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onExpand}
          disabled={loading}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/15 px-5 py-2.5 text-sm font-semibold text-amber-200 transition-all duration-150 hover:bg-amber-500/25 hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Expanding...
            </>
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