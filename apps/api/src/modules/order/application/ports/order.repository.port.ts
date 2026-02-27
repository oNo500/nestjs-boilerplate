import type { Order } from '@/modules/order/domain/aggregates/order.aggregate'

/**
 * Order Repository interface
 *
 * Defines the abstract interface for order data access
 */
export interface OrderRepository {
  findById(id: string): Promise<Order | null>
  save(order: Order): Promise<void>
  /**
   * Optimistic-lock save: UPDATE ... WHERE version = expectedVersion
   * Throws PreconditionFailedException if 0 rows affected (version has changed)
   */
  saveWithVersion(order: Order, expectedVersion: number): Promise<void>
  delete(id: string): Promise<boolean>
}

export const ORDER_REPOSITORY = Symbol('ORDER_REPOSITORY')
