import { clearPrivateCache } from '@/lib/query-client'
// src/stores/authStore.ts
import type { MeResponse } from '@/lib/api/types'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  user: MeResponse | null
  accessToken: string | null
  isAuthenticated: boolean
  setUser: (user: MeResponse | null) => void
  setAccessToken: (token: string | null) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      setUser: (user) => {
        if (get().user?.id !== user?.id) clearPrivateCache()
        set({ user, isAuthenticated: !!user })
      },
      setAccessToken: (token) => set({ accessToken: token }),
      clearAuth: () => {
        clearPrivateCache()
        set({ user: null, accessToken: null, isAuthenticated: false })
      },
    }),
    {
      name: 'ogaos-auth-storage',
      // Persist user profile so greeting shows immediately on refresh.
      // Never persist accessToken — stays in memory only.
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    },
  ),
)
