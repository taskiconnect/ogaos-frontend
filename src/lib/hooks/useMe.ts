// src/lib/hooks/useMe.ts
// Fetches /api/auth/me and syncs the result into authStore.
//
// Why guard on isAuthenticated instead of accessToken:
//   - accessToken is in-memory only — it's null after every page refresh.
//   - isAuthenticated IS persisted to localStorage via authStore.
//   - The httpOnly refresh_token cookie is always sent automatically.
//   - So on refresh: isAuthenticated=true → this hook fires → client interceptor
//     gets a 401 on the first /me call → silently refreshes token → retries → success.

import { useEffect }    from 'react'
import { useQuery }     from '@tanstack/react-query'
import { getMe }        from '@/lib/api/auth'
import { useAuthStore } from '@/stores/authStore'
import type { MeResponse } from '@/lib/api/types'

export function useMe() {
  const { isAuthenticated, setUser, clearAuth } = useAuthStore()

  const query = useQuery<MeResponse>({
    queryKey:  ['me'],
    queryFn:   getMe,
    enabled:   isAuthenticated,   // persisted — survives page refresh
    staleTime: 1000 * 60 * 5,
    gcTime:    1000 * 60 * 10,
    retry:     false,
  })

  // Sync fresh profile into store on every successful fetch
  useEffect(() => {
    if (query.data) setUser(query.data)
  }, [query.data, setUser])

  // On unrecoverable auth error — clear and redirect
  useEffect(() => {
    if (query.isError) clearAuth()
  }, [query.isError, clearAuth])

  return query
}
