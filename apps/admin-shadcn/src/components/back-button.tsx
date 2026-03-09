'use client'

import { Button } from '@workspace/ui/components/button'
import { useRouter } from 'next/navigation'

export function BackButton() {
  const router = useRouter()
  return (
    <Button variant="outline" onClick={() => router.back()}>
      Go back
    </Button>
  )
}
