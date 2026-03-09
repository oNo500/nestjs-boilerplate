import { ApiProperty } from '@nestjs/swagger'

import type { Job, JobStatus } from '@/modules/order/application/ports/job.repository.port'
import type { BulkCancelResult } from '@/modules/order/application/services/order.service'
import type { Order } from '@/modules/order/domain/aggregates/order.aggregate'
import type { OrderStatus } from '@/modules/order/domain/enums/order-status.enum'

export class OrderItemResponseDto {
  @ApiProperty({ example: 'prod_01HXYZ' })
  productId!: string

  @ApiProperty({ example: 2 })
  quantity!: number

  @ApiProperty({ example: '99.99' })
  unitPrice!: string
}

export class OrderResponseDto {
  @ApiProperty({ example: 'ord_01HXYZ' })
  id!: string

  @ApiProperty({ example: 'usr_01HXYZ' })
  userId!: string

  @ApiProperty({ enum: ['pending_payment', 'paid', 'shipping', 'completed', 'cancelled'] })
  status!: OrderStatus

  @ApiProperty({ type: () => OrderItemResponseDto, isArray: true })
  items!: OrderItemResponseDto[]

  @ApiProperty({ example: '199.98' })
  totalAmount!: string

  @ApiProperty({ example: 'CNY' })
  currency!: string

  /** Optimistic lock version number (used for ETag) */
  @ApiProperty({ example: 1, description: 'Optimistic lock version number (used for ETag)' })
  version!: number

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt!: Date

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
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
  @ApiProperty()
  id!: string

  @ApiProperty()
  type!: string

  @ApiProperty({ enum: ['pending', 'running', 'succeeded', 'failed', 'cancelled'] })
  status!: JobStatus

  @ApiProperty({ type: Object })
  payload!: Record<string, unknown>

  /** Populated after the job completes */
  @ApiProperty({ type: Object, nullable: true, description: 'Populated after the job completes' })
  result!: unknown

  /** Populated after the job fails */
  @ApiProperty({ nullable: true, description: 'Populated after the job fails', type: 'object', properties: { code: { type: 'string' }, message: { type: 'string' } } })
  error!: { code: string, message: string } | null

  @ApiProperty()
  createdAt!: Date

  @ApiProperty()
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
  @ApiProperty({ example: 'ord_01HXYZ' })
  id!: string

  @ApiProperty({ example: 204 })
  status!: 204 | 404 | 409 | 422

  @ApiProperty({ nullable: true, type: 'object', properties: { code: { type: 'string' }, message: { type: 'string' } } })
  error?: { code: string, message: string }
}

/**
 * Bulk cancel response DTO (207 Multi-Status)
 */
export class BulkCancelResponseDto {
  @ApiProperty({ example: 'batch_result' })
  object!: 'batch_result'

  @ApiProperty({ type: () => BulkCancelItemResponseDto, isArray: true })
  data!: BulkCancelItemResponseDto[]

  @ApiProperty({ type: 'object', properties: { succeeded: { type: 'number' }, failed: { type: 'number' } }, example: { succeeded: 3, failed: 1 } })
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
  @ApiProperty({ example: 'job_01HXYZ', description: 'Async job ID; client polls GET /jobs/:jobId for status' })
  jobId!: string
}
