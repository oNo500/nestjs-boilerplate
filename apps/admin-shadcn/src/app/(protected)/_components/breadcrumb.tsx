'use client'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@workspace/ui/components/breadcrumb'
import { usePathname } from 'next/navigation'
import React from 'react'

import { getLabelByHref } from '@/config/app-paths'

function getLabel(href: string): string {
  return getLabelByHref(href) ?? href.split('/').pop()!.replaceAll('-', ' ').replaceAll(/\b\w/g, (c) => c.toUpperCase())
}

export function DynamicBreadcrumb() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0) return null

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {segments.map((_segment, index) => {
          const isLast = index === segments.length - 1
          const href = '/' + segments.slice(0, index + 1).join('/')
          const label = getLabel(href)

          return (
            <React.Fragment key={href}>
              {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
              <BreadcrumbItem
                className={index < segments.length - 1 ? 'hidden md:block' : undefined}
              >
                {isLast
                  ? (
                      <BreadcrumbPage>{label}</BreadcrumbPage>
                    )
                  : (
                      <BreadcrumbLink href={href}>{label}</BreadcrumbLink>
                    )}
              </BreadcrumbItem>
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
