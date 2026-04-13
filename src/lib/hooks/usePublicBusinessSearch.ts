'use client'

import { useEffect, useState, useCallback } from 'react'
import { searchPublicBusinesses } from '@/lib/api/public'
import type {
  PublicBusinessSearchResponse,
  SearchPublicBusinessesParams,
} from '@/types/public'

interface UsePublicBusinessSearchResult {
  data: PublicBusinessSearchResponse | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function usePublicBusinessSearch(
  params: SearchPublicBusinessesParams | null
): UsePublicBusinessSearchResult {
  const [data, setData] = useState<PublicBusinessSearchResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    // Don't fetch if no params or no search query when location is not provided
    if (!params) {
      setData(null)
      setLoading(false)
      setError(null)
      return
    }

    // Check if we have either a search query OR location coordinates
    const hasQuery = params.q && params.q.trim().length > 0
    const hasLocation = typeof params.lat === 'number' && typeof params.lng === 'number'
    
    if (!hasQuery && !hasLocation) {
      setData(null)
      setLoading(false)
      setError(null)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const result = await searchPublicBusinesses(params)

      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search businesses')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [params?.q, params?.lat, params?.lng, params?.radius_km])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}