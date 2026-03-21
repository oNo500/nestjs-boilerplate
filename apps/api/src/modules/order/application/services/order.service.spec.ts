import { ConflictException, NotFoundException, UnprocessableEntityException } from '@nestjs/common'
import { vi } from 'vitest'

import { OrderFixtures } from '@/__tests__/unit/factories/domain-fixtures'
import { createOrderMocks } from '@/__tests__/unit/factories/mock-factory'
import { JobStatus } from '@/modules/order/application/ports/job.repository.port'
import { OrderService } from '@/modules/order/application/services/order.service'

const TEST_USER_ID = 'user-id-1'
const TEST_ITEMS = [{ productId: 'prod-001', quantity: 2, unitPrice: '99.99' }]

describe('orderService', () => {
  let service: OrderService
  let mocks: ReturnType<typeof createOrderMocks>

  beforeEach(() => {
    mocks = createOrderMocks()
    service = new OrderService(
      mocks.orderRepository,
      mocks.jobRepository,
      mocks.cache,
      mocks.domainEventPublisher,
    )

    mocks.orderRepository.save.mockResolvedValue()
    mocks.domainEventPublisher.publishEventsForAggregate.mockResolvedValue()
    mocks.domainEventPublisher.publish.mockResolvedValue()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('createOrder', () => {
    it('cache miss → creates order, saves idempotency cache, replayed=false', async () => {
      mocks.cache.get.mockResolvedValue(undefined)
      mocks.cache.set.mockResolvedValue(undefined)

      const idempotencyKey = 'key-001'
      const bodyHash = OrderService.computeBodyHash({ userId: TEST_USER_ID, items: TEST_ITEMS })

      const result = await service.createOrder(idempotencyKey, bodyHash, { userId: TEST_USER_ID, items: TEST_ITEMS })

      expect(result.replayed).toBe(false)
      expect(result.order.userId).toBe(TEST_USER_ID)
      expect(mocks.orderRepository.save).toHaveBeenCalledOnce()
      expect(mocks.cache.set).toHaveBeenCalledWith(
        `idempotency:${idempotencyKey}`,
        expect.objectContaining({ hash: bodyHash }),
        expect.any(Number),
      )
    })

    it('cache hit + hash matches → returns cached order, replayed=true, no save', async () => {
      const cachedOrder = OrderFixtures.pendingOrder({ id: 'cached-order-id' })
      const bodyHash = OrderService.computeBodyHash({ userId: TEST_USER_ID, items: TEST_ITEMS })

      mocks.cache.get.mockResolvedValue({ hash: bodyHash, response: { id: 'cached-order-id' } })
      mocks.orderRepository.findById.mockResolvedValue(cachedOrder)

      const result = await service.createOrder('key-001', bodyHash, { userId: TEST_USER_ID, items: TEST_ITEMS })

      expect(result.replayed).toBe(true)
      expect(result.order.id).toBe('cached-order-id')
      expect(mocks.orderRepository.save).not.toHaveBeenCalled()
    })

    it('cache hit + hash mismatch → UnprocessableEntityException(IDEMPOTENCY_KEY_REUSE_CONFLICT)', async () => {
      mocks.cache.get.mockResolvedValue({ hash: 'original-hash', response: { id: 'original-order-id' } })

      await expect(
        service.createOrder('key-001', 'different-hash', { userId: TEST_USER_ID, items: TEST_ITEMS }),
      ).rejects.toThrow(UnprocessableEntityException)
    })
  })

  describe('payOrder', () => {
    it('not found → NotFoundException', async () => {
      mocks.orderRepository.findById.mockResolvedValue(null)

      await expect(service.payOrder('non-existent-id', 0)).rejects.toThrow(NotFoundException)
    })

    it('already paid → ConflictException', async () => {
      mocks.orderRepository.findById.mockResolvedValue(OrderFixtures.paidOrder())

      await expect(service.payOrder('order-id', 0)).rejects.toThrow(ConflictException)
    })

    it('success → status=paid, saves with version, publishes OrderPaidEvent', async () => {
      const order = OrderFixtures.pendingOrder()
      mocks.orderRepository.findById.mockResolvedValue(order)
      mocks.orderRepository.saveWithVersion.mockResolvedValue()

      const result = await service.payOrder(order.id, 0)

      expect(result.status).toBe('paid')
      expect(mocks.orderRepository.saveWithVersion).toHaveBeenCalledWith(result, 0)
      expect(mocks.domainEventPublisher.publishEventsForAggregate).toHaveBeenCalledWith(result)
    })
  })

  describe('shipOrder', () => {
    it('not found → NotFoundException', async () => {
      mocks.orderRepository.findById.mockResolvedValue(null)

      await expect(service.shipOrder('non-existent-id')).rejects.toThrow(NotFoundException)
    })

    it('success → creates job, publishes events, returns jobId', async () => {
      const order = OrderFixtures.paidOrder({ id: 'order-to-ship' })
      mocks.orderRepository.findById.mockResolvedValue(order)
      mocks.jobRepository.create.mockResolvedValue({
        id: 'job-id-1',
        type: 'ship_order',
        status: JobStatus.PENDING,
        payload: { orderId: 'order-to-ship' },
        result: null,
        error: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const result = await service.shipOrder('order-to-ship')

      expect(result.jobId).toBe('job-id-1')
      expect(mocks.jobRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'ship_order', payload: { orderId: 'order-to-ship' } }),
      )
      expect(mocks.orderRepository.save).toHaveBeenCalled()
      expect(mocks.domainEventPublisher.publishEventsForAggregate).toHaveBeenCalled()
      expect(mocks.domainEventPublisher.publish).toHaveBeenCalled()
    })
  })

  describe('bulkCancel', () => {
    it('all succeed → succeeded=n, failed=0', async () => {
      mocks.orderRepository.findById
        .mockResolvedValueOnce(OrderFixtures.pendingOrder({ id: 'order-1' }))
        .mockResolvedValueOnce(OrderFixtures.pendingOrder({ id: 'order-2' }))

      const result = await service.bulkCancel(['order-1', 'order-2'])

      expect(result.succeeded).toBe(2)
      expect(result.failed).toBe(0)
      expect(result.items.every((item) => item.status === 204)).toBe(true)
    })

    it('not found → status 404, subsequent items still processed', async () => {
      mocks.orderRepository.findById
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(OrderFixtures.pendingOrder({ id: 'order-valid' }))

      const result = await service.bulkCancel(['order-not-found', 'order-valid'])

      expect(result.succeeded).toBe(1)
      expect(result.failed).toBe(1)
      expect(result.items.find((i) => i.id === 'order-not-found')?.status).toBe(404)
      expect(result.items.find((i) => i.id === 'order-valid')?.status).toBe(204)
    })

    it('already paid → status 409, subsequent items still processed', async () => {
      mocks.orderRepository.findById
        .mockResolvedValueOnce(OrderFixtures.paidOrder({ id: 'order-paid' }))
        .mockResolvedValueOnce(OrderFixtures.pendingOrder({ id: 'order-pending' }))

      const result = await service.bulkCancel(['order-paid', 'order-pending'])

      expect(result.succeeded).toBe(1)
      expect(result.failed).toBe(1)
      expect(result.items.find((i) => i.id === 'order-paid')?.status).toBe(409)
    })
  })
})
