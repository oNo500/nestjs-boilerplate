import * as React from 'react'

import { cn } from '@workspace/ui/lib/utils'

export interface NavigationItem {
  label: string
  href: string
  active?: boolean
}

export interface NavigationProps extends React.ComponentProps<'nav'> {
  items: NavigationItem[]
}

function Navigation({ className, items, ...props }: NavigationProps) {
  return (
    <nav
      data-slot="navigation"
      aria-label="Main navigation"
      className={cn('flex items-center', className)}
      {...props}
    >
      <ul className="flex items-center gap-1">
        {items.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              data-active={item.active}
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
          </li>
        ))}
      </ul>
    </nav>
  )
}

export { Navigation }
