import { cn } from '@workspace/ui/lib/utils'

export interface BlankLayoutProps extends React.ComponentProps<'div'> {
  bordered?: boolean
}

interface BlankLayoutBorderProps {
  position: 'top' | 'bottom' | 'left' | 'right'
}

function BlankLayoutBorder({ position }: BlankLayoutBorderProps) {
  const isHorizontal = position === 'top' || position === 'bottom'

  return (
    <div
      data-slot="blank-layout-border"
      data-position={position}
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute z-10 hidden bg-border lg:block',
        isHorizontal ? 'left-0 right-0 h-px' : 'bottom-0 top-0 w-px',
        position === 'top' && '-mt-px top-12',
        position === 'bottom' && '-mb-px bottom-12',
        position === 'left' && '-ml-px left-0',
        position === 'right' && '-mr-px right-0',
      )}
    />
  )
}

function BlankLayout({
  bordered = false,
  className,
  children,
  ...props
}: BlankLayoutProps) {
  return (
    <div
      data-slot="blank-layout"
      data-bordered={bordered || undefined}
      className={cn(
        'relative z-0',
        bordered && 'lg:px-12',
        className,
      )}
      {...props}
    >
      {/* Horizontal borders */}
      {bordered && (
        <>
          <BlankLayoutBorder position="top" />
          <BlankLayoutBorder position="bottom" />
        </>
      )}

      {/* Content container */}
      <div
        data-slot="blank-layout-container"
        className={cn(
          'relative mx-auto flex min-h-dvh max-w-332 flex-col',
          bordered && 'lg:pt-12',
        )}
      >
        {/* Vertical borders */}
        {bordered && (
          <>
            <BlankLayoutBorder position="left" />
            <BlankLayoutBorder position="right" />
          </>
        )}

        {/* Main content */}
        <div data-slot="blank-layout-content" className="flex flex-1 flex-col bg-card">
          {children}
        </div>

        {/* Footer spacer */}
        {bordered && (
          <span
            data-slot="blank-layout-footer"
            className="absolute inset-x-0 bottom-0 hidden h-12 bg-background lg:block"
          />
        )}
      </div>
    </div>
  )
}

export { BlankLayout }
