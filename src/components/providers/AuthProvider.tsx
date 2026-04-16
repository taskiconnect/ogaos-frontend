'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useAuthStore } from '@/stores/authStore'

export default function AuthProvider({ children }: { children: ReactNode }) {
  const { user, accessToken, setAccessToken, clearAuth } = useAuthStore()
  const [ready, setReady] = useState(false)
  const didRun = useRef(false)

  useEffect(() => {
    if (didRun.current) return
    didRun.current = true

    async function restoreSession() {
      if (accessToken) {
        setReady(true)
        return
      }

      if (!user) {
        setReady(true)
        return
      }

      try {
        const res = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        })

        if (res.ok) {
          const data = await res.json()
          const token: string | undefined =
            data?.access_token ?? data?.data?.access_token

          if (token) {
            setAccessToken(token)
          } else {
            clearAuth()
          }
        } else {
          clearAuth()
        }
      } catch {
        // Let axios 401 refresh flow handle transient network issues.
      }

      setReady(true)
    }

    restoreSession()
  }, [accessToken, user, setAccessToken, clearAuth])

  if (!ready) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl animate-pulse"
            style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}
          />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}