import { Loader2 } from 'lucide-react'
import * as React from 'react'

import { Button } from '@workspace/ui/components/ui/button'
import { cn } from '@workspace/ui/lib/utils'

import type { buttonVariants } from '@workspace/ui/components/ui/button'
import type { VariantProps } from 'class-variance-authority'

export interface LoadingButtonProps
  extends React.ComponentProps<'button'>,
  VariantProps<typeof buttonVariants> {
  loading?: boolean
  loadingText?: string
  asChild?: boolean
}

function LoadingButton({
  className,
  variant,
  size,
  loading = false,
  loadingText,
  disabled,
  children,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      className={cn(className)}
      variant={variant}
      size={size}
      disabled={loading || disabled}
      {...props}
    >
      {loading && <Loader2 className="animate-spin" />}
      {loading && loadingText ? loadingText : children}
    </Button>
  )
}

export { LoadingButton }
