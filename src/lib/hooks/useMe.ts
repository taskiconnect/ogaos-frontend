// src/hooks/useMe.ts
import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getMe } from '@/lib/api/auth'
import { useAuthStore } from '@/stores/authStore'

export function useMe() {
  const { accessToken, setUser, clearAuth } = useAuthStore()

  const query = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
    enabled: !!accessToken,  // only fetch if we have a token
    retry: false,
    staleTime: 1000 * 60 * 5, // cache for 5 minutes
  })

  useEffect(() => {
    if (query.data) {
      setUser(query.data)
    }
  }, [query.data, setUser])

  useEffect(() => {
    if (query.error) {
      clearAuth() // token is invalid or expired, clear everything
    }
  }, [query.error, clearAuth])

  return query
}