'use client'

import { useEffect, useState } from 'react'
import type { PublicBusinessPage } from '@/types/public'
import { getPublicBusinessFull } from '@/lib/api/public'

interface UsePublicBusinessPageResult {
  data: PublicBusinessPage | null
  loading: boolean
  error: string | null
}

export function usePublicBusinessPage(slug: string): UsePublicBusinessPageResult {
  const [data, setData] = useState<PublicBusinessPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function run() {
      try {
        setLoading(true)
        setError(null)

        const result = await getPublicBusinessFull(slug)

        if (!active) return
        setData(result)
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Failed to load storefront')
      } finally {
        if (active) setLoading(false)
      }
    }

    if (!slug) {
      setLoading(false)
      setError('Missing business slug')
      return
    }

    void run()

    return () => {
      active = false
    }
  }, [slug])

  return { data, loading, error }
}