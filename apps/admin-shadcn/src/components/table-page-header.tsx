import * as React from 'react'

interface TablePageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  hint?: string
}

export function TablePageHeader({ title, description, actions, hint }: TablePageHeaderProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div>{actions}</div>}
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}
