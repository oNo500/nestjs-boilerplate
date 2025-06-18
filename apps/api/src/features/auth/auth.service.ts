import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { otpsTable, profilesTable, passportTable, usersTable } from '@repo/db';
import { eq } from 'drizzle-orm';
import { pickBy } from 'lodash';
import { Logger } from 'nestjs-pino';

import { Drizzle } from '@/common/decorators';
import { UserNotFoundException } from '@/common/error';
import { DeviceType } from '@/common/decorators/device.decorator';
import { JwtValidateUser } from '@/types/interface/jwt';

import { hashPassword, validatePassword } from './utils/password';
import { RegisterDto } from './dto/register-dto';
import { OptsService } from './opts.service';
import { ResetPasswordDto } from './dto/rest-password';
import { ChangePasswordDto } from './dto/change-password-dto';
import { User } from './auth.interface';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  constructor(
    @Drizzle() private readonly db: NodePgDatabase,
    private readonly optsService: OptsService,
    private readonly logger: Logger,
    private readonly tokenService: TokenService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1)
      .then((res) => res[0]);

    if (!user) {
      throw new UserNotFoundException('用户不存在');
    }

    if (!(await validatePassword(password, user.password))) {
      throw new UnauthorizedException('密码错误');
    }

    return user;
  }

  async login(user: User, device: DeviceType) {
    const { accessToken, refreshToken } = await this.tokenService.createJwtToken(user);
    const now = new Date();
    await this.db.insert(passportTable).values({
      userId: user.id,
      refreshToken: refreshToken,
      userAgent: device.userAgent,
      createdAt: now,
      updatedAt: now,
      ...pickBy(device),
    });
    return {
      accessToken,
      refreshToken,
    };
  }

  async register(dto: RegisterDto) {
    const { email, password, code } = dto;
    const optRecord = await this.optsService.verifyOtp(email, code);

    if (!optRecord) {
      throw new BadRequestException('Verification code error');
    }

    if (optRecord.expiresAt && optRecord.expiresAt < new Date()) {
      throw new BadRequestException('Verification code expired');
    }

    const now = new Date();

    try {
      return await this.db.transaction(async (trx) => {
        const [user] = await trx
          .insert(usersTable)
          .values({
            email,
            password: await hashPassword(password),
            updatedAt: now,
            createdAt: now,
          })
          .returning();

        await trx
          .insert(profilesTable)
          .values({
            userId: user.id,
            displayName: user.email.split('@')[0],
            updatedAt: now,
            createdAt: now,
          })
          .returning();

        await trx.delete(otpsTable).where(eq(otpsTable.receiver, email));

        return user;
      });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Register failed');
    }
  }

  async resetPassword(dto: ResetPasswordDto) {
    const { email, code, password, confirmPassword } = dto;

    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const optRecord = await this.optsService.verifyOtp(email, code);

    if (!optRecord) {
      throw new BadRequestException('Verification code error');
    }
    if (optRecord.expiresAt && optRecord.expiresAt < new Date()) {
      throw new BadRequestException('Verification code expired');
    }

    try {
      return await this.db.transaction(async (trx) => {
        await trx
          .update(usersTable)
          .set({ password: await hashPassword(password) })
          .where(eq(usersTable.email, email))
          .returning();

        await trx.delete(otpsTable).where(eq(otpsTable.receiver, email));
      });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Reset password failed');
    }
  }

  async logout(id: string) {
    await this.tokenService.removeToken(id);
  }

  async changePassword(dto: ChangePasswordDto & { email: string }) {
    const { email, oldPassword, password, confirmPassword } = dto;
    const { users } = await this.findUserByEmail(email);

    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    if (!(await validatePassword(oldPassword, users.password))) {
      throw new BadRequestException('Old password error');
    }

    try {
      await this.db
        .update(usersTable)
        .set({ password: await hashPassword(password) })
        .where(eq(usersTable.email, email));
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Change password failed');
    }
  }

  async findUserByEmail(email: string): Promise<{
    users: typeof usersTable.$inferSelect;
    profiles: typeof profilesTable.$inferSelect;
  }> {
    const result = await this.db
      .select()
      .from(usersTable)
      .leftJoin(profilesTable, eq(usersTable.id, profilesTable.userId))
      .where(eq(usersTable.email, email))
      .limit(1)
      .then((res) => res[0]);
    return result;
  }
}
