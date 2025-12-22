import { Button } from '@workspace/ui/components/ui/button'

export const MainErrorFallback = () => {
  return (
    <div
      className="flex h-screen w-screen flex-col items-center justify-center text-red-500"
      role="alert"
    >
      <h2 className="text-lg font-semibold">Application Error</h2>
      <Button
        className="mt-4"
        onClick={() => globalThis.location.assign(globalThis.location.origin)}
      >
        Refresh Page
      </Button>
    </div>
  )
}
