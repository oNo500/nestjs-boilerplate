import { ApiProperty } from '@nestjs/swagger'

import { CursorListResponseDto, ListResponseDto, OffsetListResponseDto } from '@/shared-kernel/infrastructure/dtos/list-response.dto'

import type { Article, ArticleCategory } from '@/modules/article/domain/aggregates/article.aggregate'
import type { ArticleStatus } from '@/modules/article/domain/enums/article-status.enum'

export class ArticleResponseDto {
  id!: string

  title!: string

  content!: string

  slug!: string

  @ApiProperty({ enum: ['draft', 'published', 'archived'], example: 'draft' })
  status!: ArticleStatus

  tags!: string[]

  @ApiProperty({ enum: ['tech', 'design', 'product', 'other'], example: 'tech' })
  category!: ArticleCategory

  author!: string

  viewCount!: number

  isPinned!: boolean

  createdAt!: Date

  updatedAt!: Date

  publishedAt!: Date | null

  static fromDomain(article: Article): ArticleResponseDto {
    const dto = new ArticleResponseDto()
    dto.id = article.id
    dto.title = article.title.value
    dto.content = article.content.value
    dto.slug = article.slug.value
    dto.status = article.status
    dto.tags = [...article.tags.value]
    dto.category = article.category
    dto.author = article.author
    dto.viewCount = article.viewCount
    dto.isPinned = article.isPinned
    dto.createdAt = article.createdAt
    dto.updatedAt = article.updatedAt
    dto.publishedAt = article.publishedAt

    return dto
  }

  static fromDomainList(articles: Article[]): ArticleResponseDto[] {
    return articles.map((article) => ArticleResponseDto.fromDomain(article))
  }
}

export class ArticleListResponseDto extends OffsetListResponseDto<ArticleResponseDto> {
  @ApiProperty({ type: () => ArticleResponseDto, isArray: true })
  declare data: ArticleResponseDto[]
}

export class ArticleAllListResponseDto extends ListResponseDto<ArticleResponseDto> {
  @ApiProperty({ type: () => ArticleResponseDto, isArray: true })
  declare data: ArticleResponseDto[]
}

export class ArticleCursorListResponseDto extends CursorListResponseDto<ArticleResponseDto> {
  @ApiProperty({ type: () => ArticleResponseDto, isArray: true })
  declare data: ArticleResponseDto[]
}
