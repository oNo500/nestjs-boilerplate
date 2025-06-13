import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { sessionsTable } from '@repo/db';
import { pickBy } from 'lodash';
import { eq } from 'drizzle-orm';

import { Drizzle } from '@/common/decorators';

import { AuthTokensInterface, User } from './auth.interface';
import { getDeviceInfo } from './utils/os';

@Injectable()
export class SessionService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    @Drizzle() private readonly db: NodePgDatabase,
  ) {}

  async generateTokens(user: User): Promise<AuthTokensInterface> {
    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.get('ACCESS_TOKEN_SECRET'),
        expiresIn: this.config.get('ACCESS_TOKEN_EXPIRATION'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.get('REFRESH_TOKEN_SECRET'),
        expiresIn: this.config.get('REFRESH_TOKEN_EXPIRATION'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  generateRefreshTime = (day = 3): string => {
    const threeDays = day * 24 * 60 * 60 * 1000; // TODO: 和环境变量里的是什么关系？
    const refreshTime = new Date(Date.now() + threeDays);
    return refreshTime.toISOString();
  };

  // 创建 session 连接
  async createSession(user: User, userAgent: string) {
    const { accessToken, refreshToken } = await this.generateTokens(user);
    const device = getDeviceInfo(userAgent);
    const now = new Date();
    const sessionRefreshTime = this.generateRefreshTime();

    const [session] = await this.db
      .insert(sessionsTable)
      .values({
        userId: user.id,
        refreshToken: refreshToken,
        userAgent: userAgent,
        createdAt: now,
        updatedAt: now,
        ...pickBy(device),
      })
      .returning();

    return {
      sessionID: session.id,
      accessToken,
      refreshToken,
      sessionRefreshTime,
    };
  }

  async deleteSession(sessionID: string) {
    await this.db.delete(sessionsTable).where(eq(sessionsTable.id, sessionID));
  }
}
