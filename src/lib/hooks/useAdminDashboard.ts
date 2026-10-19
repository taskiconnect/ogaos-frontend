// src/lib/hooks/useAdminDashboard.ts
import { useAdminMe } from '@/lib/hooks/useAdminMe'
import { useAdminAuthStore } from '@/stores/adminAuthStore'
import { useMemo } from 'react'

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
    ],
  )
}
