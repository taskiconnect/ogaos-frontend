'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAdminAuthStore } from '@/stores/adminAuthStore'
import { useAdminMe } from '@/lib/hooks/useAdminMe'

const ADMIN_AUTH_PATHS = [
  '/admin/auth/login',
  '/admin/auth/verify-otp',
  '/admin/auth/setup-password',
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, user } = useAdminAuthStore()
  const { isLoading, isError } = useAdminMe()

  const isAuthPage = ADMIN_AUTH_PATHS.some((path) => pathname.startsWith(path))

  useEffect(() => {
    if (isAuthPage) return

    if (!isLoading && (!isAuthenticated || isError || !user)) {
      router.replace('/admin/auth/login')
    }
  }, [isAuthPage, isLoading, isAuthenticated, isError, user, router])

  if (isAuthPage) return <>{children}</>

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        Loading admin session...
      </div>
    )
  }

  if (!user) return null

  return <>{children}</>
}