'use client'

import { MenuIcon } from 'lucide-react'
import * as React from 'react'

import { Button } from '@workspace/ui/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@workspace/ui/components/ui/sheet'
import { cn } from '@workspace/ui/lib/utils'

import type { NavigationItem } from '@workspace/ui/components/plus/navigation'

export interface MobileNavigationProps extends React.ComponentProps<'div'> {
  items: NavigationItem[]
  trigger?: React.ReactNode
  title?: string
}

function MobileNavigation({
  className,
  items,
  trigger,
  title = 'Navigation',
  ...props
}: MobileNavigationProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <div data-slot="mobile-navigation" className={cn(className)} {...props}>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          {trigger ?? (
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <MenuIcon className="size-5" />
            </Button>
          )}
        </SheetTrigger>
        <SheetContent side="left" className="w-72">
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
          </SheetHeader>
          <nav aria-label="Mobile navigation" className="flex flex-col gap-1 px-4">
            {items.map((item) => (
              <a
                key={item.href}
                href={item.href}
                data-active={item.active}
                onClick={() => setOpen(false)}
                className={cn(
                  'px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  'hover:bg-accent hover:text-accent-foreground',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  item.active
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground',
                )}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  )
}

export { MobileNavigation }
