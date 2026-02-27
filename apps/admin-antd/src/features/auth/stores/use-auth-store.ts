import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

import { setToken, removeToken, setRefreshToken, removeRefreshToken } from '@/lib/token'

import type { User } from '@/features/auth/types'

/**
 * Auth store interface
 */
interface AuthStore {
  /** Currently logged-in user info */
  user: User | undefined
  /** Auth token */
  token: string | undefined
  /** Whether the user is authenticated */
  isAuthenticated: boolean
  /** Whether persist hydration has completed */
  _hasHydrated: boolean
  /** Login method */
  login: (user: User, token: string, refreshToken: string) => void
  /** Logout method (client-side only; no logout endpoint on the backend) */
  logout: () => void
  /** Update user info method */
  updateUser: (user: Partial<User>) => void
}

/**
 * Auth state store
 *
 * Manages global auth state with Zustand, persisted to localStorage via the persist middleware
 *
 * Features:
 * - User login / logout
 * - Token management (auto-synced to localStorage)
 * - User info updates
 * - Persistent auth state (survives page refresh)
 *
 * @example
 * ```tsx
 * const { user, isAuthenticated, login, logout } = useAuthStore()
 *
 * // Login
 * login({ id: '1', email: 'admin@example.com', username: 'admin' }, 'token_xxx', 'refresh_xxx')
 *
 * // Logout (client-side only)
 * logout()
 *
 * // Update user info
 * updateUser({ username: 'new-username' })
 * ```
 */
let setHydrated: (() => void) | undefined

function onAfterRehydrate() {
  setHydrated?.()
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => {
      setHydrated = () => set({ _hasHydrated: true })
      return {
        user: undefined,
        token: undefined,
        isAuthenticated: false,
        _hasHydrated: false,

        login: (user, token, refreshToken) => {
          setToken(token)
          setRefreshToken(refreshToken)
          set({ user, token, isAuthenticated: true })
        },

        logout: () => {
          removeToken()
          removeRefreshToken()
          set({ user: undefined, token: undefined, isAuthenticated: false })
        },

        updateUser: (userData) => {
          const currentUser = get().user
          if (currentUser) {
            set({ user: { ...currentUser, ...userData } })
          }
        },
      }
    },
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => onAfterRehydrate,
    },
  ),
)
