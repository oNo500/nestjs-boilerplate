import { Env } from '@/config/env';
import { DrizzleAsyncProvider } from '@/database/drizzle.provider';
import schema from '@/database/schema';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Request } from 'express';
import { extractTokenFromHeader } from './extract-token.util';
import { sessionsTable } from '@/database/schema/sessions';
import { eq, and } from 'drizzle-orm';

interface AuthenticatedRequest extends Request {
  user?: {
    sub: string;
    email: string;
  };
}

@Injectable()
export class JwtRefreshGuard implements CanActivate {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private readonly db: NodePgDatabase<typeof schema>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<Env>,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Invalid Refresh Token');
    }
    try {
      request.user = await this.jwtService.verifyAsync<{
        sub: string;
        email: string;
      }>(token, {
        secret: this.configService.get('ACCESS_TOKEN_SECRET'),
      });
      console.log(request.user);
    } catch (error) {
      // this.logger.error(error);
      console.log(error); // TODO 使用log
      throw new UnauthorizedException('Invalid Refresh Token');
    }
    const session = await this.db
      .select()
      .from(sessionsTable)
      .where(
        and(
          eq(sessionsTable.refreshToken, token),
          eq(sessionsTable.userId, request.user.sub), // TODO: 需要修改
        ),
      );

    if (!session) {
      throw new UnauthorizedException('Invalid Refresh Token');
    }

    return true;
  }
}
