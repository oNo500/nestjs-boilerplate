import { useQuery } from '@tanstack/react-query'

import { fetchClient } from '@/lib/api'

import type { AnalysisDto, MonitorDto, StatisticsDto, WorkplaceDto } from '@/features/dashboard/types'

export function useStatistics() {
  return useQuery<StatisticsDto>({
    queryKey: ['dashboard', 'statistics'],
    queryFn: async () => {
      const { data } = await fetchClient.GET('/api/users/summary' as never)
      return data as unknown as StatisticsDto
    },
  })
}

// NOTE: /api/dashboard/workplace endpoint is not yet implemented (demo data only).
// Replace this mock with a real API call once the backend endpoint is available.
export function useWorkplace() {
  return useQuery<WorkplaceDto>({
    queryKey: ['dashboard', 'workplace'],
    queryFn: (): Promise<WorkplaceDto> => Promise.resolve({
      projects: [
        { name: 'Alipay', desc: 'Alipay is the world\'s leading third-party payment platform', team: 'Team A', updatedAt: '2024-06-01' },
        { name: 'Angular', desc: 'A powerful front-end framework', team: 'Team B', updatedAt: '2024-05-20' },
        { name: 'Ant Design', desc: 'An enterprise-class UI design language', team: 'Team C', updatedAt: '2024-04-10' },
        { name: 'Ant Design Pro', desc: 'An out-of-the-box UI solution for enterprise applications', team: 'Team D', updatedAt: '2024-03-15' },
        { name: 'Bootstrap', desc: 'Bootstrap is an open source toolkit', team: 'Team E', updatedAt: '2024-02-28' },
        { name: 'React', desc: 'A JavaScript library for building user interfaces', team: 'Team F', updatedAt: '2024-01-10' },
      ],
      activities: [
        { user: 'Alice', action: 'updated', project: 'Alipay', item: 'issue #1', time: '2 min ago' },
        { user: 'Bob', action: 'commented on', project: 'Angular', item: 'pull request #2', time: '1 hr ago' },
        { user: 'Charlie', action: 'closed', project: 'Ant Design', item: 'issue #3', time: '3 hr ago' },
        { user: 'Dave', action: 'merged', project: 'Ant Design Pro', item: 'pull request #4', time: '1 day ago' },
        { user: 'Eve', action: 'opened', project: 'Bootstrap', item: 'issue #5', time: '2 days ago' },
      ],
      teams: [
        { name: 'Science Department', abbr: 'SD' },
        { name: 'Marketing Department', abbr: 'MD' },
        { name: 'R&D Department', abbr: 'RD' },
        { name: 'Operation Department', abbr: 'OD' },
      ],
      links: [
        { title: 'Operation One' },
        { title: 'Operation Two' },
        { title: 'Operation Three' },
        { title: 'Operation Four' },
        { title: 'Operation Five' },
        { title: 'Operation Six' },
      ],
    }),
  })
}

// NOTE: /api/dashboard/monitor endpoint is not yet implemented (demo data only).
// Replace this mock with a real API call once the backend endpoint is available.
export function useMonitor() {
  return useQuery<MonitorDto>({
    queryKey: ['dashboard', 'monitor'],
    queryFn: (): Promise<MonitorDto> => Promise.resolve({
      txTrend: Array.from({ length: 20 }, (_, i) => ({
        time: `${String(i).padStart(2, '0')}:00`,
        value: Math.floor(Math.random() * 100) + 20,
      })),
      categoryRatio: [
        { name: 'Category A', value: 35, fill: '#5470c6' },
        { name: 'Category B', value: 25, fill: '#91cc75' },
        { name: 'Category C', value: 20, fill: '#fac858' },
        { name: 'Category D', value: 15, fill: '#ee6666' },
        { name: 'Category E', value: 5, fill: '#73c0de' },
      ],
      hotSearch: [
        { index: 1, keyword: 'Ant Design', count: 10_200, range: 30.5, trend: 'up' },
        { index: 2, keyword: 'React', count: 8800, range: 22.3, trend: 'up' },
        { index: 3, keyword: 'NestJS', count: 7300, range: 11.6, trend: 'down' },
        { index: 4, keyword: 'TypeScript', count: 6500, range: 9.2, trend: 'up' },
        { index: 5, keyword: 'GraphQL', count: 5100, range: 5.8, trend: 'down' },
      ],
    }),
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
