import { SetMetadata } from '@nestjs/common';

export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
};

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLES_KEY = 'roles';

export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
