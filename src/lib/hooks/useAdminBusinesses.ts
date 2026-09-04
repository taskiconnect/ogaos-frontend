'use client'

import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { listAdminBusinesses, getAdminBusiness } from '@/lib/api/admin'
import type { AdminBusinessListParams } from '@/types/admin-business'

export function useAdminBusinessList(filters: Omit<AdminBusinessListParams, 'cursor'>) {
  const query = useInfiniteQuery({
    queryKey: ['admin-businesses', filters],
    queryFn: ({ pageParam }: { pageParam?: string }) =>
      listAdminBusinesses({ ...filters, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
  })

  const businesses = query.data?.pages.flatMap((page) => page.data) ?? []

  return { ...query, businesses }
}

export function useAdminBusinessDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['admin-business', id],
    queryFn: () => getAdminBusiness(id as string),
    select: (res) => res.data,
    enabled: !!id,
  })
}
