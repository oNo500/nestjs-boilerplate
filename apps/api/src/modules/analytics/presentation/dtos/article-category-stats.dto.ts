import { ApiProperty } from '@nestjs/swagger'

export class ArticleCategoryStatItemDto {
  @ApiProperty({ enum: ['tech', 'design', 'product', 'other'] })
  category!: 'tech' | 'design' | 'product' | 'other'

  @ApiProperty({ description: 'Total article count in this category' })
  count!: number

  @ApiProperty({ description: 'Total view count for this category' })
  viewCount!: number
}

export class ArticleCategoryStatsDto {
  @ApiProperty({ type: [ArticleCategoryStatItemDto] })
  categories!: ArticleCategoryStatItemDto[]
}
