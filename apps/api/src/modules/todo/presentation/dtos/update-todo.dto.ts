import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator'

/**
 * Update Todo DTO
 *
 * Validates request body for updating a todo
 * All fields are optional, only provided fields will be updated
 */
export class UpdateTodoDto {
  /**
   * Todo title
   * @example Complete project documentation
   */
  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string

  /**
   * Todo description
   * @example Write API docs and architecture guide
   */
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string

  /**
   * Completed status
   * @example true
   */
  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean
}
