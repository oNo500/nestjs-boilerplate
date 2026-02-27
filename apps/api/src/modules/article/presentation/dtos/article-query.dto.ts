import { CursorPaginationDto } from '@/shared-kernel/infrastructure/dtos/cursor-pagination.dto'
import { OffsetPaginationDto } from '@/shared-kernel/infrastructure/dtos/offset-pagination.dto'

export class ArticleQueryDto extends OffsetPaginationDto {}

export class ArticleCursorQueryDto extends CursorPaginationDto {}
