import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Res,
  Headers,
  PreconditionFailedException,
} from '@nestjs/common'
import { ApiHeader, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'

import { OrderService } from '@/modules/order/application/services/order.service'
import { BulkCancelDto } from '@/modules/order/presentation/dtos/bulk-cancel.dto'
import { CreateOrderDto } from '@/modules/order/presentation/dtos/create-order.dto'
import {
  BulkCancelResponseDto,
  OrderResponseDto,
  ShipOrderResponseDto,
} from '@/modules/order/presentation/dtos/order-response.dto'
import { ErrorCode } from '@/shared-kernel/infrastructure/enums/error-code'

import type { Response } from 'express'

/**
 * Demonstrates 4 advanced HTTP features:
 * - Idempotent requests (Idempotency-Key): POST /orders
 * - Optimistic locking (If-Match / ETag): PATCH /orders/:id/pay
 * - Async operations (202 Accepted): POST /orders/:id/ship
 * - Bulk operations (207 Multi-Status): DELETE /orders/bulk-cancel
 */
@ApiTags('orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: 'Create order (idempotent)' })
  @ApiHeader({
    name: 'Idempotency-Key',
    description: 'Client-generated UUID to prevent duplicate order submissions',
    required: true,
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({ status: 201, description: 'Order created successfully', type: OrderResponseDto })
  @ApiResponse({ status: 200, description: 'Idempotent replay (response header contains Idempotent-Replayed: true)', type: OrderResponseDto })
  @ApiResponse({ status: 422, description: 'Same Idempotency-Key but different request body' })
  async create(
    @Headers('idempotency-key') idempotencyKey: string,
    @Body() dto: CreateOrderDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<OrderResponseDto> {
    if (!idempotencyKey) {
      throw new BadRequestException({
        code: ErrorCode.BAD_REQUEST,
        message: 'The Idempotency-Key request header is required',
      })
    }

    const bodyHash = OrderService.computeBodyHash(dto)
    const { order, replayed } = await this.orderService.createOrder(idempotencyKey, bodyHash, {
      userId: dto.userId,
      items: dto.items,
      currency: dto.currency,
    })

    if (replayed) {
      res.status(HttpStatus.OK)
      res.setHeader('Idempotent-Replayed', 'true')
    } else {
      res.status(HttpStatus.CREATED)
    }

    return OrderResponseDto.fromDomain(order)
  }

  @Patch(':id/pay')
  @ApiOperation({ summary: 'Confirm payment (optimistic locking)' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiHeader({
    name: 'If-Match',
    description: 'ETag version number (from GET /orders/:id response header), format: "<number>"',
    required: true,
    example: '"0"',
  })
  @ApiResponse({ status: 200, description: 'Payment successful', type: OrderResponseDto })
  @ApiResponse({ status: 412, description: 'Version conflict (order was modified by another request)' })
  @ApiResponse({ status: 428, description: 'Missing If-Match request header' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 409, description: 'Order already paid' })
  async pay(
    @Param('id') id: string,
    @Headers('if-match') ifMatch: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<OrderResponseDto> {
    if (!ifMatch) {
      throw new PreconditionFailedException({
        code: ErrorCode.PRECONDITION_REQUIRED,
        message: 'The If-Match request header (order version number) is required to prevent concurrent conflicts',
      })
    }

    // Parse version number: If-Match: "5" → 5
    const versionStr = ifMatch.replaceAll(/^"|"$/g, '')
    const expectedVersion = Number.parseInt(versionStr, 10)

    if (Number.isNaN(expectedVersion)) {
      throw new BadRequestException({
        code: ErrorCode.BAD_REQUEST,
        message: `Invalid If-Match format: ${ifMatch}, expected a quoted integer, e.g. "0"`,
      })
    }

    const order = await this.orderService.payOrder(id, expectedVersion)

    res.setHeader('ETag', `"${order.version}"`)

    return OrderResponseDto.fromDomain(order)
  }

  @Post(':id/ship')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Initiate shipping (async)' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({
    status: 202,
    description: 'Shipping request accepted; poll the URL in the Location header for job status',
    type: ShipOrderResponseDto,
    headers: {
      Location: { description: 'Job status polling URL', example: '/api/jobs/550e8400-...' },
    },
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 400, description: 'Order status does not allow shipping' })
  async ship(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ShipOrderResponseDto> {
    try {
      const { jobId } = await this.orderService.shipOrder(id)
      res.setHeader('Location', `/api/jobs/${jobId}`)
      return { jobId }
    } catch (error) {
      if (error instanceof NotFoundException) throw error
      if (error instanceof Error) {
        throw new BadRequestException({ code: ErrorCode.BAD_REQUEST, message: error.message })
      }
      throw error
    }
  }

  @Delete('bulk-cancel')
  @ApiOperation({ summary: 'Bulk cancel orders (207 Multi-Status)' })
  @ApiResponse({ status: 200, description: 'All orders cancelled successfully', type: BulkCancelResponseDto })
  @ApiResponse({ status: 207, description: 'Partial success (includes per-item error details)', type: BulkCancelResponseDto })
  async bulkCancel(
    @Body() dto: BulkCancelDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<BulkCancelResponseDto> {
    const result = await this.orderService.bulkCancel(dto.ids)
    const response = BulkCancelResponseDto.fromResult(result)

    if (result.failed > 0) {
      res.status(HttpStatus.MULTI_STATUS)
    }

    return response
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order details (response includes ETag)' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({
    status: 200,
    description: 'Query successful',
    type: OrderResponseDto,
    headers: { ETag: { description: 'Version number for optimistic locking', example: '"0"' } },
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async findById(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<OrderResponseDto> {
    const order = await this.orderService.findById(id)

    if (!order) {
      throw new NotFoundException({
        code: ErrorCode.ORDER_NOT_FOUND,
        message: `Order ${id} not found`,
      })
    }

    res.setHeader('ETag', `"${order.version}"`)

    return OrderResponseDto.fromDomain(order)
  }
}
