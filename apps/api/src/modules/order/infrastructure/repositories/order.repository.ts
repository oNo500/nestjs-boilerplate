import { Inject, Injectable, PreconditionFailedException } from '@nestjs/common'
import { ordersTable } from '@workspace/database'
import { eq, and } from 'drizzle-orm'

import { Order } from '@/modules/order/domain/aggregates/order.aggregate'
import { OrderStatus } from '@/modules/order/domain/enums/order-status.enum'
import { Money } from '@/modules/order/domain/value-objects/money.vo'
import { OrderItem } from '@/modules/order/domain/value-objects/order-item.vo'
import { DB_TOKEN } from '@/shared-kernel/infrastructure/db/db.port'
import { ErrorCode } from '@/shared-kernel/infrastructure/enums/error-code'

import type { OrderRepository } from '@/modules/order/application/ports/order.repository.port'
import type { DrizzleDb } from '@/shared-kernel/infrastructure/db/db.port'
import type { OrderDatabase } from '@workspace/database'

/**
 * Order Repository Drizzle implementation
 *
 * saveWithVersion uses optimistic locking: UPDATE ... WHERE id = ? AND version = ?
 * If 0 rows are updated, the version has been modified by another request; throws 412.
 */
@Injectable()
export class OrderRepositoryImpl implements OrderRepository {
  constructor(@Inject(DB_TOKEN) private readonly db: DrizzleDb) {}

  async findById(id: string): Promise<Order | null> {
    const [row] = await this.db.select().from(ordersTable).where(eq(ordersTable.id, id))
    return row ? this.toDomain(row) : null
  }

  async save(order: Order): Promise<void> {
    const data = this.toPersistence(order)
    await this.db
      .insert(ordersTable)
      .values(data)
      .onConflictDoUpdate({
        target: ordersTable.id,
        set: {
          status: data.status,
          version: data.version,
          updatedAt: data.updatedAt,
        },
      })
  }

  /**
   * Optimistic-lock save with version check
   *
   * UPDATE orders SET ... WHERE id = ? AND version = ?
   * Empty result indicates a version conflict; throws 412 Precondition Failed.
   */
  async saveWithVersion(order: Order, expectedVersion: number): Promise<void> {
    const data = this.toPersistence(order)

    const result = await this.db
      .update(ordersTable)
      .set({
        status: data.status,
        version: data.version,
        updatedAt: data.updatedAt,
      })
      .where(and(eq(ordersTable.id, order.id), eq(ordersTable.version, expectedVersion)))
      .returning({ id: ordersTable.id })

    if (result.length === 0) {
      throw new PreconditionFailedException({
        code: ErrorCode.ORDER_VERSION_CONFLICT,
        message: `Order ${order.id} has a version conflict; the current version is stale, please fetch the latest order data`,
      })
    }
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.delete(ordersTable).where(eq(ordersTable.id, id)).returning()
    return result.length > 0
  }

  // ========== Domain model <-> Persistence model mapping ==========

  private toDomain(row: OrderDatabase): Order {
    const items = (row.items as { productId: string, quantity: number, unitPrice: string }[]).map(
      (item) => OrderItem.create(item.productId, item.quantity, item.unitPrice),
    )

    return Order.reconstitute(
      row.id,
      row.userId,
      row.status as OrderStatus,
      items,
      Money.create(row.totalAmount, row.currency),
      row.version,
      row.createdAt,
      row.updatedAt,
    )
  }

  private toPersistence(order: Order): OrderDatabase {
    return {
      id: order.id,
      userId: order.userId,
      status: order.status,
      items: order.items.map((item) => item.toPlain()),
      totalAmount: order.totalAmount.amount,
      currency: order.totalAmount.currency,
      version: order.version,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }
  }
}

// Re-export for use in the module

export { ORDER_REPOSITORY } from '@/modules/order/application/ports/order.repository.port'
