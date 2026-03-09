import { ApiProperty } from '@nestjs/swagger'

import { ListResponseDto } from '@/shared-kernel/infrastructure/dtos/list-response.dto'

export class TodoResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string

  @ApiProperty({ example: 'Buy groceries' })
  title: string

  @ApiProperty({ type: String, example: 'Milk, eggs, bread', nullable: true })
  description: string | null

  @ApiProperty({ example: false })
  isCompleted: boolean

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt: Date

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt: Date
}

export class TodoListResponseDto extends ListResponseDto<TodoResponseDto> {
  @ApiProperty({ type: () => TodoResponseDto, isArray: true })
  declare data: TodoResponseDto[]
}
