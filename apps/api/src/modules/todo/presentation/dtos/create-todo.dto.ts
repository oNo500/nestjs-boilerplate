import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'

/**
 * Create Todo DTO
 *
 * Validates request body for creating a todo
 */
export class CreateTodoDto {
  /**
   * Todo title
   * @example Complete project documentation
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string

  /**
   * Todo description (optional)
   * @example Write API docs and architecture guide
   */
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string

  /**
   * Completed status (optional, defaults to false)
   * @example false
   */
  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean
}
