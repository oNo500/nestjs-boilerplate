export interface User {
  id: string
  name: string
  displayName: string | null
  email: string
  emailVerified: boolean
  image: string | null
  role: string | null
  banned: boolean
  banReason: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateUserDto {
  name?: string
  displayName?: string
  email: string
  password: string
  role?: string
}

export interface UpdateUserDto {
  name?: string
  displayName?: string
  banned?: boolean
  banReason?: string
}

export interface UserListResponse {
  object: 'list'
  data: User[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface GetUsersParams {
  page?: number
  pageSize?: number
  search?: string
  role?: string
  banned?: boolean
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}
