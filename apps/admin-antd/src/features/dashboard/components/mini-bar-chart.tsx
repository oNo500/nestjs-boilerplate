import { BarChart, Bar } from 'recharts'

import type { HourPoint } from '@/features/dashboard/types'

interface Props { data: HourPoint[], color: string }

export function MiniBarChart({ data, color }: Props) {
  return (
    <BarChart
      responsive
      style={{ width: '100%', height: 50 }}
      data={data}
      margin={{ top: 2, right: 0, left: 0, bottom: 2 }}
    >
      <Bar dataKey="value" fill={color} isAnimationActive={false} radius={[1, 1, 0, 0]} />
    </BarChart>
  )
}
