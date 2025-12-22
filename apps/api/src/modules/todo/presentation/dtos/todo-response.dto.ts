/**
 * Todo Response DTO
 */
export class TodoResponseDto {
  /** Todo ID */
  id: string

  /** Title */
  title: string

  /** Description */
  description: string | null

  /** Completed status */
  isCompleted: boolean

  /** Created at */
  createdAt: Date

  /** Updated at */
  updatedAt: Date
}
