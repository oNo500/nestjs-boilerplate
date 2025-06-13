import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { otpsTable, profilesTable, usersTable } from '@repo/db';
import { eq } from 'drizzle-orm';
import { pick } from 'lodash';
import { Logger } from 'nestjs-pino';

import { Drizzle } from '@/common/decorators';

import { LoginDto } from './dto/login-dto';
import { hashPassword, validatePassword } from './utils/password';
import { RegisterDto } from './dto/register-dto';
import { OptsService } from './opts.service';
import { ResetPasswordDto } from './dto/rest-password';
import { SessionService } from './session.service';
import { ChangePasswordDto } from './dto/change-password-dto';

@Injectable()
export class AuthService {
  constructor(
    @Drizzle() private readonly db: NodePgDatabase,
    private readonly optsService: OptsService,
    private readonly sessionService: SessionService,
    private readonly logger: Logger,
  ) {}

  async login(dto: LoginDto, userAgent: string) {
    const { email, password } = dto;
    const { users, profiles } = await this.findUserByEmail(email);

    if (!users) {
      throw new UnauthorizedException('用户不存在');
    }

    if (!(await validatePassword(password, users.password))) {
      throw new UnauthorizedException('密码错误');
    }

    const sessionRecord = await this.sessionService.createSession(
      users,
      userAgent,
    );

    return {
      ...sessionRecord,
      user: {
        ...pick(users, ['id', 'email', 'createdAt', 'updatedAt']),
        profile: pick(profiles, [
          'id',
          'name',
          'avatar',
          'createdAt',
          'updatedAt',
        ]),
      },
    };
  }

  async register(dto: RegisterDto) {
    const { email, password, code } = dto;
    const optRecord = await this.optsService.verifyOtp(email, code);

    if (!optRecord) {
      throw new BadRequestException('验证吗错误');
    }

    if (optRecord.expiresAt && optRecord.expiresAt < new Date()) {
      throw new BadRequestException('验证码已过期');
    }

    const now = new Date();

    try {
      return await this.db.transaction(async (trx) => {
        const [user] = await trx
          .insert(usersTable)
          .values({
            email,
            username: email.split('@')[0],
            password: await hashPassword(password),
            updatedAt: now,
            createdAt: now,
          })
          .returning();

        await trx
          .insert(profilesTable)
          .values({
            userId: user.id,
            username: user.username,
            updatedAt: now,
            createdAt: now,
          })
          .returning();

        await trx.delete(otpsTable).where(eq(otpsTable.receiver, email));

        return user;
      });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('注册失败');
    }
  }

  async resetPassword(dto: ResetPasswordDto) {
    const { email, code, password, confirmPassword } = dto;

    if (password !== confirmPassword) {
      throw new BadRequestException('两次输入的密码不一致');
    }

    const optRecord = await this.optsService.verifyOtp(email, code);

    if (!optRecord) {
      throw new BadRequestException('验证码错误');
    }
    if (optRecord.expiresAt && optRecord.expiresAt < new Date()) {
      throw new BadRequestException('验证码已过期');
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
      throw new InternalServerErrorException('修改密码失败');
    }
  }

  async logout(sessionID: string) {
    await this.sessionService.deleteSession(sessionID);
  }

  async changePassword(dto: ChangePasswordDto & { email: string }) {
    const { email, oldPassword, password, confirmPassword } = dto;
    const { users } = await this.findUserByEmail(email);

    if (password !== confirmPassword) {
      throw new BadRequestException('两次输入的密码不一致');
    }

    if (!(await validatePassword(oldPassword, users.password))) {
      throw new BadRequestException('旧密码错误');
    }

    try {
      await this.db
        .update(usersTable)
        .set({ password: await hashPassword(password) })
        .where(eq(usersTable.email, email));
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('修改密码失败');
    }
  }

  async findUserByEmail(email: string) {
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
