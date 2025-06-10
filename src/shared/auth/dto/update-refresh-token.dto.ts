import { Session } from '@/shared/auth/entities/session.entity';

export class UpdateRefreshTokenDto {
  session: Session;
  refresh_token: string;
}
