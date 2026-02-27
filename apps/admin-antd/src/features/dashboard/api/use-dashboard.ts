import { useQuery } from '@tanstack/react-query'

import { fetchClient } from '@/lib/api'

import type { AnalysisDto, MonitorDto, StatisticsDto, WorkplaceDto } from '@/features/dashboard/types'

export function useStatistics() {
  return useQuery<StatisticsDto>({
    queryKey: ['dashboard', 'statistics'],
    queryFn: async () => {
      const { data } = await fetchClient.GET('/api/dashboard/statistics' as never)
      return data as unknown as StatisticsDto
    },
  })
}

export function useWorkplace() {
  return useQuery<WorkplaceDto>({
    queryKey: ['dashboard', 'workplace'],
    queryFn: async () => {
      const { data } = await fetchClient.GET('/api/dashboard/workplace' as never)
      return data as unknown as WorkplaceDto
    },
  })
}

export function useMonitor() {
  return useQuery<MonitorDto>({
    queryKey: ['dashboard', 'monitor'],
    queryFn: async () => {
      const { data } = await fetchClient.GET('/api/dashboard/monitor' as never)
      return data as unknown as MonitorDto
    },
  })
}

export function useAnalysis() {
  return useQuery<AnalysisDto>({
    queryKey: ['dashboard', 'analysis'],
    queryFn: async () => {
      const { data } = await fetchClient.GET('/api/dashboard/analysis' as never)
      return data as unknown as AnalysisDto
    },
  })
}
