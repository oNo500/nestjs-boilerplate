import { ApiProperty } from '@nestjs/swagger'

/**
 * Cursor pagination response base class
 *
 * Spec references:
 * - Stripe API Pagination: https://docs.stripe.com/api/pagination
 * - Google AIP-158: https://google.aip.dev/158
 */
export class ListResponseDto<T> {
  @ApiProperty({
    description: 'Object type identifier',
    example: 'list',
    enum: ['list'],
  })
  object: 'list'

  @ApiProperty({
    description: 'Data array',
    isArray: true,
  })
  data: T[]

  @ApiProperty({
    description: 'Whether more data exists',
    example: true,
  })
  has_more: boolean

  @ApiProperty({
    description: 'Next page cursor (Base64 encoded)',
    example: 'eyJpZCI6InVzcl8wMjAifQ==',
    required: false,
  })
  next_cursor?: string
}

/**
 * Offset pagination response base class
 *
 * Spec references:
 * - Google AIP-158 + Stripe API hybrid style
 * - Flat structure, computed fields removed
 */
export class OffsetListResponseDto<T> {
  @ApiProperty({
    description: 'Object type identifier',
    example: 'list',
    enum: ['list'],
  })
  object: 'list'

  @ApiProperty({
    description: 'Data array',
    isArray: true,
  })
  data: T[]

  @ApiProperty({
    description: 'Current page number (1-based)',
    example: 1,
  })
  page: number

  @ApiProperty({
    description: 'Items per page',
    example: 20,
  })
  page_size: number

  @ApiProperty({
    description: 'Total items',
    example: 100,
  })
  total: number

  @ApiProperty({
    description: 'Whether more data exists',
    example: true,
  })
  has_more: boolean
}
