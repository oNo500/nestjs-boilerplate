import { Inject, Injectable, Logger } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'

import { JOB_REPOSITORY, JobStatus } from '@/modules/order/application/ports/job.repository.port'
import { OrderShipRequestedEvent } from '@/modules/order/domain/events/order-ship-requested.event'

import type { JobRepository } from '@/modules/order/application/ports/job.repository.port'

/**
 * Ship order event handler
 *
 * Listens for OrderShipRequestedEvent and simulates a time-consuming logistics API call.
 * In production, this would call a third-party logistics provider.
 */
@Injectable()
export class ShipOrderHandler {
  private readonly logger = new Logger(ShipOrderHandler.name)

  constructor(
    @Inject(JOB_REPOSITORY)
    private readonly jobRepository: JobRepository,
  ) {}

  @OnEvent(OrderShipRequestedEvent.name, { async: true })
  async handle(event: OrderShipRequestedEvent): Promise<void> {
    const { orderId, jobId } = event

    this.logger.log(`Processing ship job jobId=${jobId} orderId=${orderId}`)

    // Update job status to running
    await this.jobRepository.updateStatus(jobId, JobStatus.RUNNING)

    try {
      // Simulate a time-consuming logistics API call (2 seconds)
      await new Promise<void>((resolve) => setTimeout(resolve, 2000))

      // Simulate generating a tracking number
      const trackingNumber = `SF${Date.now()}`

      // Update job status to succeeded
      await this.jobRepository.updateStatus(jobId, JobStatus.SUCCEEDED, { trackingNumber })

      this.logger.log(`Ship job completed jobId=${jobId} trackingNumber=${trackingNumber}`)
    } catch (error) {
      this.logger.error(`Ship job failed jobId=${jobId}`, error)

      await this.jobRepository.updateStatus(jobId, JobStatus.FAILED, undefined, {
        code: 'SHIPPING_FAILED',
        message: error instanceof Error ? error.message : 'Logistics API call failed',
      })
    }
  }
}
