import { cva } from 'class-variance-authority'
import NextLink from 'next/link'

import { cn } from '@workspace/ui/lib/utils'

import type { VariantProps } from 'class-variance-authority'
import type { LinkProps as NextLinkProperties } from 'next/link'

const linkVariants = cva(
  'underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors',
  {
    variants: {
      variant: {
        default: 'text-primary',
        nav: 'text-foreground/80 hover:text-foreground',
        muted: 'text-muted-foreground hover:text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

type LinkProperties = {
  className?: string
  children: React.ReactNode
  target?: string
} & NextLinkProperties
& VariantProps<typeof linkVariants>

export const Link = ({
  className,
  children,
  href,
  variant,
  ...properties
}: LinkProperties) => {
  return (
    <NextLink
      href={href}
      className={cn(linkVariants({ variant }), className)}
      {...properties}
    >
      {children}
    </NextLink>
  )
}
