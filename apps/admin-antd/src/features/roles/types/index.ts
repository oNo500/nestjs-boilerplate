export interface AssignRoleDto {
  role: string
}

export interface AssignRoleResponse {
  id: string
  role: string | null
}

export type UserRole = 'USER' | 'ADMIN'
