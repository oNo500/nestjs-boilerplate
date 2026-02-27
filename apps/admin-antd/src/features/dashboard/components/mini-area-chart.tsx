import { AreaChart, Area } from 'recharts'

import type { TrendPoint } from '@/features/dashboard/types'

interface Props { data: TrendPoint[], color: string }

export function MiniAreaChart({ data, color }: Props) {
  const id = `mini-area-${color.replace('#', '')}`
  return (
    <AreaChart
      responsive
      style={{ width: '100%', height: 50 }}
      data={data}
      margin={{ top: 2, right: 0, left: 0, bottom: 2 }}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={color} stopOpacity={0.3} />
          <stop offset="95%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <Area
        type="monotone"
        dataKey="value"
        stroke={color}
        fill={`url(#${id})`}
        strokeWidth={2}
        dot={false}
        isAnimationActive={false}
      />
    </AreaChart>
  )
}
