/**
 * User Repository token
 */
export const USER_REPOSITORY = Symbol('USER_REPOSITORY')

/**
 * User data structure
 *
 * Adapted from better-auth schema:
 * - banned: Ban status flag
 * - No soft delete support
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

/**
 * Data for creating user
 */
export interface CreateUserData {
  id: string
  name: string
  email: string
  role?: string
}

/**
 * User Repository interface
 *
 * Manages core user data:
 * - User ID lifecycle
 * - Ban management
 */
export interface UserRepository {
  /**
   * Create user
   */
  create(data: CreateUserData): Promise<User>

  /**
   * Find by ID
   */
  findById(id: string): Promise<User | null>

  /**
   * Set user ban status
   */
  setBanned(id: string, banned: boolean, reason?: string, expires?: Date): Promise<boolean>

  /**
   * Hard delete user
   */
  hardDelete(id: string): Promise<boolean>

  /**
   * Check if user exists
   */
  exists(id: string): Promise<boolean>

  /**
   * Check if user exists and is active
   */
  existsAndActive(id: string): Promise<boolean>
}
