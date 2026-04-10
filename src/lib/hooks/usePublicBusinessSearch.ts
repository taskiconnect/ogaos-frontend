'use client'

import { useEffect, useState } from 'react'
import { searchPublicBusinesses } from '@/lib/api/public'
import type {
  PublicBusinessSearchResponse,
  SearchPublicBusinessesParams,
} from '@/types/public'

interface UsePublicBusinessSearchResult {
  data: PublicBusinessSearchResponse | null
  loading: boolean
  error: string | null
}

export function usePublicBusinessSearch(
  params: SearchPublicBusinessesParams | null
): UsePublicBusinessSearchResult {
  const [data, setData] = useState<PublicBusinessSearchResponse | null>(null)
  const [loading, setLoading] = useState(Boolean(params))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function run() {
      if (!params?.state || !params?.lga) {
        setLoading(false)
        setData(null)
        setError(null)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const result = await searchPublicBusinesses(params)

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
  }, [params?.q, params?.state, params?.lga, params?.radius_km])

  return { data, loading, error }
}