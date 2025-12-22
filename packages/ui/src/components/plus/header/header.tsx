import { cva } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@workspace/ui/lib/utils'

import type { VariantProps } from 'class-variance-authority'

const headerVariants = cva(
  'flex items-center justify-between px-4 py-3 w-full',
  {
    variants: {
      variant: {
        static: '',
        sticky: 'sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
      },
    },
    defaultVariants: {
      variant: 'static',
    },
  },
)

export interface HeaderProps
  extends React.ComponentProps<'header'>,
  VariantProps<typeof headerVariants> {}

function Header({ className, variant, ...props }: HeaderProps) {
  return (
    <header
      data-slot="header"
      className={cn(headerVariants({ variant, className }))}
      {...props}
    />
  )
}

export type HeaderStartProps = React.ComponentProps<'div'>

function HeaderStart({ className, ...props }: HeaderStartProps) {
  return (
    <div
      data-slot="header-start"
      className={cn('flex items-center gap-2', className)}
      {...props}
    />
  )
}

export type HeaderCenterProps = React.ComponentProps<'div'>

function HeaderCenter({ className, ...props }: HeaderCenterProps) {
  return (
    <div
      data-slot="header-center"
      className={cn('flex flex-1 items-center justify-center', className)}
      {...props}
    />
  )
}

export type HeaderEndProps = React.ComponentProps<'div'>

function HeaderEnd({ className, ...props }: HeaderEndProps) {
  return (
    <div
      data-slot="header-end"
      className={cn('flex items-center gap-2', className)}
      {...props}
    />
  )
}

export {
  Header,
  HeaderCenter,
  HeaderEnd,
  HeaderStart,
  headerVariants,
}
