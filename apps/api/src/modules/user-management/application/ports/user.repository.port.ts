/**
 * User info (adapted to better-auth schema)
 *
 * Aggregates data from multiple tables:
 * - users: id, name, email, role, banned, timestamps
 * - profiles: displayName (optional)
 * - accounts: email (via providerId=email)
 */
export interface UserInfo {
  id: string
  name: string
  displayName: string | null
  email: string
  emailVerified: boolean
  image: string | null
  role: string | null
  banned: boolean
  banReason: string | null
  createdAt: Date
  updatedAt: Date
}

/**
 * User list query parameters
 */
export interface UserListQuery {
  page: number
  pageSize: number
  search?: string
  role?: string
  banned?: boolean
}

/**
 * User list query result
 */
export interface UserListResult {
  data: UserInfo[]
  total: number
}

/**
 * Create user data
 */
export interface CreateUserData {
  name: string
  displayName?: string
  email: string
  password: string
  role?: string
}

/**
 * Update user data
 */
export interface UpdateUserData {
  name?: string
  displayName?: string | null
  banned?: boolean
  banReason?: string | null
  role?: string | null
}

/**
 * Update user profile data (excludes role; role changes go through a dedicated method)
 */
export interface UpdateUserProfileData {
  name?: string
  displayName?: string | null
  banned?: boolean
  banReason?: string | null
}

/**
 * User summary statistics
 */
export interface UserSummary {
  total: number
  active: number // banned = false
  adminCount: number // role = 'ADMIN'
  newToday: number // createdAt >= today 00:00
}

/**
 * User Repository port interface
 *
 * Defines persistence operations for user management
 */
export interface UserManagementRepository {
  /**
   * Paginated user list query
   */
  findAll(query: UserListQuery): Promise<UserListResult>

  /**
   * Find a user by ID
   */
  findById(id: string): Promise<UserInfo | null>

  /**
   * Find a user by email
   */
  findByEmail(email: string): Promise<UserInfo | null>

  /**
   * Check whether an email already exists
   */
  existsByEmail(email: string): Promise<boolean>

  /**
   * Create a user (includes users + accounts + profiles)
   */
  create(data: CreateUserData): Promise<UserInfo>

  /**
   * Update a user
   */
  update(id: string, data: UpdateUserData): Promise<UserInfo | null>

  /**
   * Delete a user (hard delete)
   */
  hardDelete(id: string): Promise<boolean>

  /**
   * Get user summary statistics
   */
  getSummary(): Promise<UserSummary>
}

/**
 * Repository injection token
 */
export const USER_MANAGEMENT_REPOSITORY = Symbol('USER_MANAGEMENT_REPOSITORY')
