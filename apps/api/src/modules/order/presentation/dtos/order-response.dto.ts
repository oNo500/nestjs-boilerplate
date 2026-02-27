import { ApiProperty } from '@nestjs/swagger'

import type { Job, JobStatus } from '@/modules/order/application/ports/job.repository.port'
import type { BulkCancelResult } from '@/modules/order/application/services/order.service'
import type { Order } from '@/modules/order/domain/aggregates/order.aggregate'
import type { OrderStatus } from '@/modules/order/domain/enums/order-status.enum'

export class OrderItemResponseDto {
  productId!: string
  quantity!: number
  unitPrice!: string
}

export class OrderResponseDto {
  id!: string

  userId!: string

  @ApiProperty({ enum: ['pending_payment', 'paid', 'shipping', 'completed', 'cancelled'] })
  status!: OrderStatus

  items!: OrderItemResponseDto[]

  totalAmount!: string

  currency!: string

  /** Optimistic lock version number (used for ETag) */
  version!: number

  createdAt!: Date

  updatedAt!: Date

  static fromDomain(order: Order): OrderResponseDto {
    const dto = new OrderResponseDto()
    dto.id = order.id
    dto.userId = order.userId
    dto.status = order.status
    dto.items = order.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    }))
    dto.totalAmount = order.totalAmount.amount
    dto.currency = order.totalAmount.currency
    dto.version = order.version
    dto.createdAt = order.createdAt
    dto.updatedAt = order.updatedAt
    return dto
  }
}

export class JobResponseDto {
  id!: string

  type!: string

  status!: JobStatus

  payload!: Record<string, unknown>

  /** Populated after the job completes */
  result!: unknown

  /** Populated after the job fails */
  error!: { code: string, message: string } | null

  createdAt!: Date

  updatedAt!: Date

  static fromDomain(job: Job): JobResponseDto {
    const dto = new JobResponseDto()
    dto.id = job.id
    dto.type = job.type
    dto.status = job.status
    dto.payload = job.payload
    dto.result = job.result
    dto.error = job.error
    dto.createdAt = job.createdAt
    dto.updatedAt = job.updatedAt
    return dto
  }
}

export class BulkCancelItemResponseDto {
  id!: string

  @ApiProperty({ example: 204 })
  status!: 204 | 404 | 409 | 422

  error?: { code: string, message: string }
}

/**
 * Bulk cancel response DTO (207 Multi-Status)
 */
export class BulkCancelResponseDto {
  object!: 'batch_result'

  data!: BulkCancelItemResponseDto[]

  summary!: { succeeded: number, failed: number }

  static fromResult(result: BulkCancelResult): BulkCancelResponseDto {
    const dto = new BulkCancelResponseDto()
    dto.object = 'batch_result'
    dto.data = result.items
    dto.summary = { succeeded: result.succeeded, failed: result.failed }
    return dto
  }
}

/**
 * Ship order response (202 Accepted)
 *
 * Returns the async job ID; client polls GET /jobs/:jobId for status.
 */
export class ShipOrderResponseDto {
  jobId!: string
}
