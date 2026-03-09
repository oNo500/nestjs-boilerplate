'use client'

import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
} from '@workspace/ui/components/card'
import { Separator } from '@workspace/ui/components/separator'
import { Activity } from 'lucide-react'
import { motion, useInView } from 'motion/react'
import { useMemo, useRef } from 'react'

import { $api } from '@/lib/api'

const SalesByCountryWidget = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  const { data: auditData } = $api.useQuery('get', '/api/audit-logs', {
    params: { query: { pageSize: 100 } },
  })

  const topActions = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const log of auditData?.data ?? []) {
      counts[log.action] = (counts[log.action] ?? 0) + 1
    }
    return Object.entries(counts)
      .toSorted((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([action, count]) => ({ action, count }))
  }, [auditData])

  return (
    <Card className="h-full py-6 gap-6">
      <CardHeader className="flex items-center justify-between px-6">
        <CardTitle className="text-lg font-medium text-foreground">
          Top Audit Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <motion.div
          ref={ref}
          className="flex flex-col gap-3"
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
              },
            },
          }}
        >
          {topActions.map((item, index) => (
            <div key={item.action}>
              <motion.div
                className="flex gap-3 items-center px-6"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 24,
                }}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  className="w-8 h-8 rounded-full flex justify-center items-center bg-muted"
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <Activity size={16} className="text-muted-foreground" />
                </motion.div>
                <div className="flex items-center justify-between flex-1">
                  <div>
                    <h5 className="text-base font-medium text-foreground">
                      {item.count}
                    </h5>
                    <p className="text-sm font-normal tracking-wide text-muted-foreground">
                      {item.action}
                    </p>
                  </div>
                </div>
              </motion.div>
              {index < topActions.length - 1 && <Separator />}
            </div>
          ))}
          {topActions.length === 0 && (
            <p className="px-6 text-sm text-muted-foreground">No audit log data</p>
          )}
        </motion.div>
      </CardContent>
    </Card>
  )
}

export default SalesByCountryWidget
