import { ApiProperty } from '@nestjs/swagger'

import { IsIntField, IsStringField, MinField } from '@/shared-kernel/infrastructure/decorators/validators'

export class OrderItemDto {
  @ApiProperty({ example: 'prod_01HXYZ' })
  @IsStringField()
  productId!: string

  @ApiProperty({ example: 2 })
  @IsIntField()
  @MinField(1)
  quantity!: number

  /** String type ensures precision safety */
  @ApiProperty({ example: '99.99', description: 'Unit price as string to ensure decimal precision safety' })
  @IsStringField()
  unitPrice!: string
}
