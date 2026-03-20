'use client'

// src/components/providers/AuthProvider.tsx
//
// On every hard refresh the access token is gone from memory (never persisted).
// This runs once on mount and silently restores the session via the Next.js
// /api/auth/refresh proxy — which correctly forwards the httpOnly cookie
// server-side, avoiding cross-origin cookie restrictions.

import { useEffect, useRef, useState } from 'react'
import { useAuthStore } from '@/stores/authStore'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, accessToken, setAccessToken, clearAuth } = useAuthStore()
  const [ready, setReady]   = useState(false)
  const didRun              = useRef(false)  // prevent StrictMode double-fire

  useEffect(() => {
    if (didRun.current) return
    didRun.current = true

    async function restoreSession() {
      // Token already in memory (e.g. navigated client-side) — nothing to do
      if (accessToken) {
        setReady(true)
        return
      }

      // No persisted user — not logged in, let middleware handle it
      if (!user) {
        setReady(true)
        return
      }

      // User in localStorage but no token → call the Next.js proxy
      // (NOT the backend directly — cross-origin cookies won't be sent by the browser)
      try {
        const res = await fetch('/api/auth/refresh', {
          method:      'POST',
          credentials: 'include',   // sends cookies to the Next.js route (same origin)
          headers:     { 'Content-Type': 'application/json' },
        })

        if (res.ok) {
          const data = await res.json()
          const token: string | undefined =
            data?.access_token ?? data?.data?.access_token

          if (token) {
            setAccessToken(token)
          } else {
            // Proxy returned 200 but no token — unexpected, clear and re-login
            clearAuth()
          }
        } else {
          // 401 — refresh cookie expired or invalid, must re-login
          clearAuth()
        }
      } catch {
        // Network error — don't clear auth, just let them proceed
        // (they'll get 401s on API calls which will trigger the axios interceptor)
      }

      setReady(true)
    }

    restoreSession()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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