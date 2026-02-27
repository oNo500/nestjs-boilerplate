export const USER_REPOSITORY = Symbol('USER_REPOSITORY')

/**
 * Adapts to the better-auth schema: uses a boolean banned field instead of status; no soft delete.
 */
export interface User {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image: string | null
  role: string | null
  banned: boolean
  banReason: string | null
  banExpires: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface CreateUserData {
  id: string
  name: string
  email: string
  role?: string
}

export interface UserRepository {
  create(data: CreateUserData): Promise<User>
  findById(id: string): Promise<User | null>
  setBanned(id: string, banned: boolean, reason?: string, expires?: Date): Promise<boolean>
  hardDelete(id: string): Promise<boolean>
  exists(id: string): Promise<boolean>
  existsAndActive(id: string): Promise<boolean>
}
