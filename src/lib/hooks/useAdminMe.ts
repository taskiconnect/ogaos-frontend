// src/lib/hooks/useAdminMe.ts
import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAdminProfile } from '@/lib/api/admin'
import { useAdminAuthStore } from '@/stores/adminAuthStore'
import type { AdminProfileApiResponse } from '@/types/admin'

export function useAdminMe() {
  const { isAuthenticated, setUser, clearAuth } = useAdminAuthStore()

  const query = useQuery<AdminProfileApiResponse>({
    queryKey: ['admin-me'],
    queryFn: getAdminProfile,
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
    gcTime:    1000 * 60 * 10,
    // Retry once on failure — catches transient network blips on page load
    // without masking a genuine 401.
    retry: 1,
  })

  // Sync fresh profile data into the store
  useEffect(() => {
    const profile = query.data?.data
    if (profile) setUser(profile)
  }, [query.data, setUser])

  // Only log out if the backend explicitly says the token is invalid (401/403).
  // A network error, 500, or timeout on refresh should NOT wipe the session —
  // the user would be silently logged out just because the server had a hiccup.
  useEffect(() => {
    if (!query.isError) return

    const status = (query.error as any)?.response?.status
    if (status === 401 || status === 403) {
      clearAuth()
    }
  }, [query.isError, query.error, clearAuth])

  return query
}