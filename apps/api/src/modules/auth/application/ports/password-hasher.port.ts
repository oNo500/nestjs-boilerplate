/**
 * Password Hasher injection token
 */
export const PASSWORD_HASHER = Symbol('PASSWORD_HASHER')

/**
 * Password hasher interface
 *
 * Abstracts password hashing and verification, decoupled from the concrete hashing algorithm
 */
export interface PasswordHasher {
  /**
   * Hash a plain-text password
   */
  hash(plainPassword: string): Promise<string>

  /**
   * Verify whether a plain-text password matches its hash
   */
  verify(plainPassword: string, hash: string): Promise<boolean>
}
