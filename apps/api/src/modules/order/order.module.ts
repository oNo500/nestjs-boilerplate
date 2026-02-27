import { Module } from '@nestjs/common'

import { CacheModule } from '@/modules/cache/cache.module'
import { OrderEventsListener } from '@/modules/order/application/listeners/order-events.listener'
import { ShipOrderHandler } from '@/modules/order/application/listeners/ship-order.handler'
import { JOB_REPOSITORY } from '@/modules/order/application/ports/job.repository.port'
import { ORDER_REPOSITORY } from '@/modules/order/application/ports/order.repository.port'
import { OrderService } from '@/modules/order/application/services/order.service'
import { JobRepositoryImpl } from '@/modules/order/infrastructure/repositories/job.repository'
import { OrderRepositoryImpl } from '@/modules/order/infrastructure/repositories/order.repository'
import { JobController } from '@/modules/order/presentation/controllers/job.controller'
import { OrderController } from '@/modules/order/presentation/controllers/order.controller'

/**
 * Order Module
 *
 * Rich-domain DDD module demonstrating 4 advanced HTTP features:
 * - Idempotent requests (Idempotency-Key)
 * - Optimistic locking (If-Match / ETag)
 * - Async operations (202 Accepted)
 * - Bulk operations (207 Multi-Status)
 */
@Module({
  imports: [
    // Import CacheModule to access CACHE_PORT (idempotency key storage)
    CacheModule,
  ],
  controllers: [OrderController, JobController],
  providers: [
    // Application Service
    OrderService,

    // Event Listeners
    ShipOrderHandler,
    OrderEventsListener,

    // Repository implementations (DIP)
    {
      provide: ORDER_REPOSITORY,
      useClass: OrderRepositoryImpl,
    },
    {
      provide: JOB_REPOSITORY,
      useClass: JobRepositoryImpl,
    },
  ],
})
export class OrderModule {}
