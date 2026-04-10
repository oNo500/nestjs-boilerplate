interface AuditDetail {
  before?: unknown
  after?: unknown
  meta?: unknown
  [key: string]: unknown
}

interface AuditDetailViewProps {
  detail: AuditDetail
}

export function AuditDetailView({ detail }: AuditDetailViewProps) {
  const { before, after, meta, ...rest } = detail
  const hasDiff = before !== undefined || after !== undefined
  const hasOtherFields = Object.keys(rest).length > 0

  return (
    <div className="space-y-3 py-2">
      {hasDiff && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="mb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Before
            </p>
            <pre className="max-h-48 overflow-auto rounded bg-muted px-3 py-2 text-xs">
              {before === undefined ? 'null' : JSON.stringify(before, null, 2)}
            </pre>
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              After
            </p>
            <pre className="max-h-48 overflow-auto rounded bg-muted px-3 py-2 text-xs">
              {after === undefined ? 'null' : JSON.stringify(after, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {meta !== undefined && (
        <div>
          <p className="mb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Meta
          </p>
          <pre className="max-h-48 overflow-auto rounded bg-muted px-3 py-2 text-xs">
            {JSON.stringify(meta, null, 2)}
          </pre>
        </div>
      )}

      {!hasDiff && hasOtherFields && (
        <div>
          <p className="mb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Detail
          </p>
          <pre className="max-h-48 overflow-auto rounded bg-muted px-3 py-2 text-xs">
            {JSON.stringify(rest, null, 2)}
          </pre>
        </div>
      )}

      {!hasDiff && !hasOtherFields && (
        <p className="text-xs text-muted-foreground">No detail available.</p>
      )}
    </div>
  )
}
