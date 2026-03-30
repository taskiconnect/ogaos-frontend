// src/lib/hooks/useAdminDashboard.ts
import { useMemo } from 'react'
import { useAdminAuthStore } from '@/stores/adminAuthStore'
import { useAdminMe } from '@/lib/hooks/useAdminMe'

export function useAdminDashboard() {
  const { user, isAuthenticated } = useAdminAuthStore()
  const meQuery = useAdminMe()

  return useMemo(
    () => ({
      admin: user,
      isAuthenticated,
      isLoading: meQuery.isLoading,
      isFetching: meQuery.isFetching,
      isError: meQuery.isError,
      error: meQuery.error,
      refetchAdmin: meQuery.refetch,
    }),
    [
      user,
      isAuthenticated,
      meQuery.isLoading,
      meQuery.isFetching,
      meQuery.isError,
      meQuery.error,
      meQuery.refetch,
    ]
  )
}