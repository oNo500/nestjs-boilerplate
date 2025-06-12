import { z } from 'zod';

export const jwtConstants = {
  secret:
    'DO NOT USE THIS VALUE. INSTEAD, CREATE A COMPLEX SECRET AND KEEP IT SAFE OUTSIDE OF THE SOURCE CODE.',
};

export const roleSchema = z.enum(['ADMIN', 'USER']);

export type Role = z.infer<typeof roleSchema>;

export const APP_NAME = 'Turborepo';
export const APP_VERSION = '1.0.0';
export const APP_VERSION_PROVIDER = 'v1';
export const APP_URL = 'https://turbo-npn.vercel.app';
export const APP_LOGO_URL = `${APP_URL}/assets/logo/icon.svg`;
