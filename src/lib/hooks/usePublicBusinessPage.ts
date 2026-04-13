'use client'

import { useEffect, useState, useCallback } from 'react' // Added useCallback
import type { PublicBusinessPage } from '@/types/public'
import { getPublicBusinessFull } from '@/lib/api/public'

interface UsePublicBusinessPageResult {
  data: PublicBusinessPage | null
  loading: boolean
  error: string | null
  refetch: () => void // Added refetch function
}

export function usePublicBusinessPage(slug: string): UsePublicBusinessPageResult {
  const [data, setData] = useState<PublicBusinessPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBusinessPage = useCallback(async () => {
    if (!slug) {
      setLoading(false)
      setError('Missing business slug')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const result = await getPublicBusinessFull(slug)

      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load storefront')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    fetchBusinessPage()
  }, [fetchBusinessPage])

  return { data, loading, error, refetch: fetchBusinessPage }
}