export interface ProfileData {
  id: string
  email: string
  name: string
  displayName: string | null
  bio: string | null
  avatarUrl: string | null
}

export interface UpdateProfileData {
  displayName?: string | null
  bio?: string | null
  avatarUrl?: string | null
}

export interface ProfileRepository {
  findById(id: string): Promise<ProfileData | null>
  update(id: string, data: UpdateProfileData): Promise<ProfileData | null>
}

export const PROFILE_REPOSITORY = Symbol('PROFILE_REPOSITORY')
