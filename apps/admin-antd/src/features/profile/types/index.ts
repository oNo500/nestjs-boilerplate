export interface Profile {
  userId: string
  displayName: string | null
  avatarUrl: string | null
  bio: string | null
  createdAt: string
  updatedAt: string
}

export interface UpdateProfileDto {
  displayName?: string | null
  avatarUrl?: string | null
  bio?: string | null
}

export interface ChangePasswordDto {
  currentPassword: string
  newPassword: string
}
