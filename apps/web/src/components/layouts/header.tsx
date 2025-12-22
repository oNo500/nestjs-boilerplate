import { cva } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@workspace/ui/lib/utils'

import type { VariantProps } from 'class-variance-authority'

const headerVariants = cva(
  'flex items-center justify-between h-[3rem] box-border px-4 w-full',
  {
    variants: {
      variant: {
        static: '',
        sticky:
          'sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
      },
    },
    defaultVariants: {
      variant: 'static',
    },
  },
)

export interface HeaderProps
  extends React.ComponentProps<'header'>, VariantProps<typeof headerVariants> {}

function Header({ className, variant, ...props }: HeaderProps) {
  return (
    <header
      data-slot="header"
      className={cn(headerVariants({ variant, className }))}
      {...props}
    />
  )
}

export { Header }
