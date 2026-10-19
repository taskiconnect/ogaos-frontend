'use client'
import AdminDashboardHeader from '@/components/admin/AdminDashboardHeader'
import AdminSidebar from '@/components/admin/AdminSidebar'

import { useAdminMe } from '@/lib/hooks/useAdminMe'
import { useAdminAuthStore } from '@/stores/adminAuthStore'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

const ADMIN_AUTH_PATHS = ['/admin/auth/login', '/admin/auth/verify-otp', '/admin/setup-password']

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, user } = useAdminAuthStore()
  const { isLoading, isError, error, refetch } = useAdminMe()
  const invalid = [401, 403].includes((error as { status?: number })?.status ?? 0)

  const isAuthPage = ADMIN_AUTH_PATHS.some((path) => pathname.startsWith(path))

  useEffect(() => {
    if (isAuthPage) return

    if (!isLoading && (!isAuthenticated || invalid || !user)) {
      router.replace('/admin/auth/login')
    }
  }, [isAuthPage, isLoading, isAuthenticated, invalid, user, router])

  if (isAuthPage) return <>{children}</>

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        Loading admin session...
      </div>
    )
  }

  if (isError && !invalid)
    return (
      <div role="alert" className="p-10 text-sm">
        Your admin session could not be checked.{' '}
        <button onClick={() => void refetch()} className="text-blue-400">
          Try again
        </button>
      </div>
    )
  if (!user) return null

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AdminSidebar admin={user} />
      <div className="lg:pl-72">
        <AdminDashboardHeader />
        {children}
      </div>
    </div>
  )
}
