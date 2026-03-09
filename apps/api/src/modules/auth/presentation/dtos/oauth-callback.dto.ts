export interface OAuthUserProfile {
  provider: 'google' | 'github'
  providerId: string
  email: string
  name: string
  accessToken?: string
  refreshToken?: string
  accessTokenExpiresAt?: Date
  scope?: string
}
