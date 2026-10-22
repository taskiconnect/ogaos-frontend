'use client'
import SubscriptionNotice from '@/features/messages/SubscriptionNotice'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import Sidebar from '@/components/dashboard/Sidebar'
import { PlanAccess } from '@/features/dashboard/PlanAccess'
import { useMe } from '@/lib/hooks/useMe'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
/** Dashboard access depends on authentication, never on a paid subscription. */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const authenticated = useAuthStore((s) => s.isAuthenticated)
  const router = useRouter()
  useMe()
  useEffect(() => {
    if (!authenticated) router.replace('/auth/login')
  }, [authenticated, router])
  if (!authenticated)
    return (
      <div role="status" className="p-10">
        Opening sign in…
      </div>
    )
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="lg:pl-72">
        <DashboardHeader />
        <SubscriptionNotice />
        <PlanAccess>{children}</PlanAccess>
      </div>
    </div>
  )
}
