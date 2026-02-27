import { IsIntField, IsStringField, MinField } from '@/shared-kernel/infrastructure/decorators/validators'

export class OrderItemDto {
  @IsStringField()
  productId!: string

  @IsIntField()
  @MinField(1)
  quantity!: number

  /** String type ensures precision safety */
  @IsStringField()
  unitPrice!: string
}
