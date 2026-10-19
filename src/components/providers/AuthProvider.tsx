'use client'
import { asApiError } from '@/lib/api/errors'
import { refreshSession } from '@/lib/api/http'
import { useAuthStore } from '@/stores/authStore'
import { useEffect, useState } from 'react'
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    let mounted = true
    const restore = async () => {
      await useAuthStore.persist.rehydrate()
      const { user, accessToken, clearAuth } = useAuthStore.getState()
      if (user && !accessToken) {
        try {
          await refreshSession('user')
        } catch (error) {
          if ([401, 403].includes(asApiError(error).status ?? 0)) clearAuth()
        }
      }
      if (mounted) setReady(true)
    }
    void restore()
    return () => {
      mounted = false
    }
  }, [])
  if (!ready)
    return (
      <div className="min-h-screen grid place-items-center bg-background text-foreground">
        <p role="status" className="text-sm text-muted-foreground">
          Opening your workspace…
        </p>
      </div>
    )
  return <>{children}</>
}
