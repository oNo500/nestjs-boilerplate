import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { User } from '@/types/api';

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
}

interface AuthActions {
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

type AuthStore = AuthState & AuthActions;

export const authStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      token: null,
      user: null,
      login: (token: string, user: User) =>
        set({
          token,
          user,
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        }),
      setUser: (user: User) => set({ user }),
    }),
    {
      name: 'auth-storage',
    },
  ),
);
