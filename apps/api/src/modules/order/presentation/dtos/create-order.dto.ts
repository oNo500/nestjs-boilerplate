import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsArray, IsOptional, ValidateNested } from 'class-validator'

import { OrderItemDto } from '@/modules/order/presentation/dtos/order-item.dto'
import { IsStringField, MatchesField } from '@/shared-kernel/infrastructure/decorators/validators'

export class CreateOrderDto {
  @ApiProperty({ example: 'usr_01HXYZ' })
  @IsStringField()
  userId!: string

  @ApiProperty({ type: () => OrderItemDto, isArray: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[]

  @ApiPropertyOptional({ example: 'CNY', description: '3 uppercase letters, e.g. CNY, USD' })
  @IsOptional()
  @IsStringField()
  @MatchesField(/^[A-Z]{3}$/, { message: 'Currency code must be 3 uppercase letters, e.g. CNY, USD' })
  currency?: string
}
