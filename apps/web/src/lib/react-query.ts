import type { UseMutationOptions, DefaultOptions } from '@tanstack/react-query'

export const queryConfig = {
  queries: {
    // throwOnError: true,
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 1000 * 60,
  },
} satisfies DefaultOptions

type ApiFunctionReturnType<FunctionType extends (...arguments_: unknown[]) => Promise<unknown>>
  = Awaited<ReturnType<FunctionType>>

export type QueryConfig<T extends (...arguments_: unknown[]) => unknown> = Omit<
  ReturnType<T>,
  'queryKey' | 'queryFn'
>

export type MutationConfig<
  MutationFunctionType extends (...arguments_: unknown[]) => Promise<unknown>,
> = UseMutationOptions<
  ApiFunctionReturnType<MutationFunctionType>,
  Error,
  Parameters<MutationFunctionType>[0]
>
