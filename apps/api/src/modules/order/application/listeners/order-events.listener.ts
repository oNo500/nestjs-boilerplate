import { Inject, Injectable, Logger } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { ClsService } from 'nestjs-cls'

import { OrderCancelledEvent } from '@/modules/order/domain/events/order-cancelled.event'
import { OrderCreatedEvent } from '@/modules/order/domain/events/order-created.event'
import { OrderPaidEvent } from '@/modules/order/domain/events/order-paid.event'
import { OrderShipRequestedEvent } from '@/modules/order/domain/events/order-ship-requested.event'
import { AUDIT_LOGGER } from '@/shared-kernel/application/ports/audit-logger.port'

import type { AuditLogger } from '@/shared-kernel/application/ports/audit-logger.port'

@Injectable()
export class OrderEventsListener {
  private readonly logger = new Logger(OrderEventsListener.name)

  constructor(
    @Inject(AUDIT_LOGGER) private readonly auditLogger: AuditLogger,
    private readonly cls: ClsService,
  ) {}

  @OnEvent(OrderCreatedEvent.name)
  async handleOrderCreated(event: OrderCreatedEvent): Promise<void> {
    this.logger.log(`Order created: ${event.orderId}`)
    await this.auditLogger.log({
      action: 'order.created',
      resourceType: 'order',
      resourceId: event.orderId,
      actorId: this.cls.get<string>('userId'),
      actorEmail: this.cls.get<string>('userEmail'),
      detail: { userId: event.userId },
    })
  }

  @OnEvent(OrderPaidEvent.name)
  async handleOrderPaid(event: OrderPaidEvent): Promise<void> {
    this.logger.log(`Order paid: ${event.orderId}`)
    await this.auditLogger.log({
      action: 'order.paid',
      resourceType: 'order',
      resourceId: event.orderId,
      actorId: this.cls.get<string>('userId'),
      actorEmail: this.cls.get<string>('userEmail'),
      detail: {},
    })
  }

  @OnEvent(OrderCancelledEvent.name)
  async handleOrderCancelled(event: OrderCancelledEvent): Promise<void> {
    this.logger.log(`Order cancelled: ${event.orderId}`)
    await this.auditLogger.log({
      action: 'order.cancelled',
      resourceType: 'order',
      resourceId: event.orderId,
      actorId: this.cls.get<string>('userId'),
      actorEmail: this.cls.get<string>('userEmail'),
      detail: {},
    })
  }

  @OnEvent(OrderShipRequestedEvent.name)
  async handleOrderShipRequested(event: OrderShipRequestedEvent): Promise<void> {
    this.logger.log(`Order ship requested: ${event.orderId}`)
    await this.auditLogger.log({
      action: 'order.ship_requested',
      resourceType: 'order',
      resourceId: event.orderId,
      actorId: this.cls.get<string>('userId'),
      actorEmail: this.cls.get<string>('userEmail'),
      detail: { jobId: event.jobId },
    })
  }
}
