import { ApiProperty } from '@nestjs/swagger'

import { ListResponseDto } from '@/shared-kernel/infrastructure/dtos/list-response.dto'

export class TodoResponseDto {
  id: string

  title: string

  description: string | null

  isCompleted: boolean

  createdAt: Date

  updatedAt: Date
}

export class TodoListResponseDto extends ListResponseDto<TodoResponseDto> {
  @ApiProperty({ type: () => TodoResponseDto, isArray: true })
  declare data: TodoResponseDto[]
}
