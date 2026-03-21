export const IDENTITY_PORT = Symbol('IDENTITY_PORT')

export interface UserIdentity {
  id: string
  name: string
  email: string
  role: string | null
  banned: boolean
}

/**
 * Cross-context port for querying basic user identity data.
 * Implemented by the identity context, consumed by any context that needs user info.
 */
export interface IdentityPort {
  findIdentityById(id: string): Promise<UserIdentity | null>
  existsAndActive(id: string): Promise<boolean>
}
