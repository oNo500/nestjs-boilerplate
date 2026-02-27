import { Spin } from 'antd'

import { useAuthStore } from '@/features/auth/stores/use-auth-store'

export function AppInitializer({ children }: { children: React.ReactNode }) {
  const hasHydrated = useAuthStore((state) => state._hasHydrated)

  if (!hasHydrated) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}
      >
        <Spin size="large" />
      </div>
    )
  }

  return <>{children}</>
}
