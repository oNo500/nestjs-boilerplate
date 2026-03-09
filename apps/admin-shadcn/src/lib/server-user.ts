import { cookies } from 'next/headers'

import type { StoredUser } from '@/lib/token'

export async function getServerUser(): Promise<StoredUser | null> {
  const cookieStore = await cookies()
  const raw = cookieStore.get('user')?.value
  if (!raw) return null
  try {
    return JSON.parse(decodeURIComponent(raw)) as StoredUser
  } catch {
    return null
  }
}
