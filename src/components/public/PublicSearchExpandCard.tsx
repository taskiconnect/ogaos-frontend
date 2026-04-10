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
    <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-yellow-500/20 bg-yellow-500/10">
            <Compass className="h-4.5 w-4.5 text-yellow-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-yellow-300">
              No businesses found within {radiusKM} km
            </h3>
            <p className="mt-0.5 text-sm text-yellow-400/60">
              Expand to{' '}
              <span className="font-semibold text-yellow-300">{suggestedRadiusKM} km</span>{' '}
              to discover more businesses nearby.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onExpand}
          disabled={loading}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-yellow-600/80 border border-yellow-500/30 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-150 hover:bg-yellow-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
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