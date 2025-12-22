/**
 * Password Hasher token
 */
export const PASSWORD_HASHER = Symbol('PASSWORD_HASHER')

/**
 * Password Hasher interface
 *
 * Handles password hashing and verification, abstracts hashing algorithm implementation
 */
export interface PasswordHasher {
  /**
   * Hash plain text password
   */
  hash(plainPassword: string): Promise<string>

  /**
   * Verify plain text password matches hash
   */
  verify(plainPassword: string, hash: string): Promise<boolean>
}
