import {
  extractName,
  generateOTP,
  generateRefreshTime,
  hashString,
  validateString,
} from '@/shared/util';
import { eq, or, and, gt, InferInsertModel } from 'drizzle-orm';
import { Env } from '@/config/env';
import {
  AuthTokensInterface,
  LoginUserInterface,
  RefreshTokenInterface,
  RegisterUserInterface,
} from '@/shared/auth/auth.interface';
import {
  ChangePasswordDto,
  CreateUserDto,
  ForgotPasswordDto,
  RefreshTokenDto,
  ResetPasswordDto,
  SignInUserDto,
  SignOutAllDeviceUserDto,
  SignOutUserDto,
  ValidateUserDto,
} from '@/shared/auth/dto';
import { otpsTable } from '@/database/schema/otps';
import { sessionsTable } from '@/database/schema/sessions';
import { MailService } from '@/shared/mail/mail.service';
import {
  ChangePasswordSuccessMail,
  ResetPasswordMail,
} from '@/shared/mail/templates';
import { profilesTable } from '@/database/schema/profiles';
import { usersTable } from '@/database/schema/users';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Logger } from 'nestjs-pino';
import { User } from '@/shared/auth/auth.interface';
import { InferSelectModel } from 'drizzle-orm';
import { DrizzleAsyncProvider } from '@/database/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import schema from '@/database/schema';
import { DeviceInfoDto } from './dto/device-info.dto';
import { pickBy } from 'lodash-es';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private readonly db: NodePgDatabase<typeof schema>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService<Env>,
    private readonly mailService: MailService,
    private readonly logger: Logger,
  ) {}

  /**
   * @description Generate Refresh Token and Access Token
   * @param user
   * @return Promise<AuthTokensInterface>
   */
  async generateTokens(user: User): Promise<AuthTokensInterface> {
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(
        {
          username: user.username,
          email: user.email,
          id: user.id,
        },
        {
          secret: this.config.get('ACCESS_TOKEN_SECRET'),
          expiresIn: this.config.get('ACCESS_TOKEN_EXPIRATION'),
        },
      ),
      this.jwtService.signAsync(
        {
          username: user.username,
          email: user.email,
          id: user.id,
        },
        {
          secret: this.config.get('REFRESH_TOKEN_SECRET'),
          expiresIn: this.config.get('REFRESH_TOKEN_EXPIRATION'),
        },
      ),
    ]);

    return {
      access_token,
      refresh_token,
    };
  }

  /**
   * @description Validate User with identifier and password
   * @param dto
   * @return Promise<User>
   */

  async validateUser(dto: ValidateUserDto): Promise<User> {
    const result = await this.db
      .select()
      .from(usersTable)
      .leftJoin(profilesTable, eq(usersTable.id, profilesTable.userId))
      .where(
        or(
          eq(usersTable.email, dto.identifier),
          eq(usersTable.username, dto.identifier),
        ),
      )
      .limit(1)
      .then((rows) => rows[0]);

    if (!result) throw new NotFoundException('User not found');

    const isValid = await validateString(
      dto.password,
      result.users.password ?? '',
    );
    if (!isValid) throw new UnauthorizedException('Invalid credentials');

    return result.users;
  }

  /**
   * @description SignIn User Account
   * @param dto
   * @return Promise<LoginUserInterface>
   */
  async signIn(
    dto: SignInUserDto,
    deviceInfo: DeviceInfoDto,
  ): Promise<LoginUserInterface> {
    try {
      const user = await this.validateUser(dto);

      if (!user) throw new NotFoundException('用户不存在');

      // 密码校验
      const isValid = await validateString(dto.password, user.password ?? '');
      if (!isValid) throw new UnauthorizedException('密码错误');

      const tokens = await this.generateTokens(user);
      const now = new Date();

      // drizzle-orm 插入 session
      type Session = InferInsertModel<typeof sessionsTable>;
      const sessionData: Session = {
        ...deviceInfo,
        userId: user.id,
        refreshToken: tokens.refresh_token,
        createdAt: now,
        updatedAt: now,
      };

      const [session] = await this.db
        .insert(sessionsTable)
        .values(pickBy(sessionData) as Session)
        .returning();

      const session_refresh_time = generateRefreshTime(); //3 days default
      return {
        data: user,
        tokens: { ...tokens, session_token: session.id, session_refresh_time },
      };
    } catch (error) {
      this.logger.error(error);

      // 只抛出已知异常，其他抛 500
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      throw new BadRequestException('登录异常，请联系管理员');
    }
  }

  /**
   * @description Forgot your password, to get your password reset token
   * @param dto
   * @return Promise<void>
   */
  async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
    // 1. 查找用户
    const result = await this.db
      .select()
      .from(usersTable)
      .where(or(eq(usersTable.email, dto.identifier)))
      .limit(1)
      .then((rows) => rows[0]);
    if (!result) throw new NotFoundException('User not found');
    // 2. 生成 OTP
    const passwordResetToken = generateOTP();
    const now = new Date();
    await this.db.insert(otpsTable).values({
      otp: passwordResetToken,
      type: 'PASSWORD_RESET',
      expires: new Date(now.getTime() + 1000 * 60 * 60 * 24),
      createdAt: now,
      updatedAt: now,
    });
    // 3. 发送邮件
    await this.mailService.sendEmail({
      to: [result.email],
      subject: 'Reset your password',
      html: ResetPasswordMail({
        name: result?.username ?? '',
        code: passwordResetToken,
      }),
    });
  }

  /**
   * @description Reset your password with your password reset token
   * @param dto
   * @return Promise<void>
   */
  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    // 1. 查找用户
    const result = await this.db
      .select()
      .from(usersTable)
      .where(or(eq(usersTable.email, dto.identifier)))
      .limit(1)
      .then((rows) => rows[0]);
    if (!result) throw new NotFoundException('User not found');
    // 2. 查找 OTP
    const otp = await this.db
      .select()
      .from(otpsTable)
      .where(
        and(
          eq(otpsTable.otp, dto.resetToken),
          eq(otpsTable.type, 'PASSWORD_RESET'),
        ),
      )
      .limit(1)
      .then((rows) => rows[0]);
    if (!otp) throw new NotFoundException('Invalid password reset token');
    if (otp.otp !== dto.resetToken)
      throw new BadRequestException('Invalid password reset token');
    if (otp.otp && new Date() > otp.expires)
      throw new BadRequestException('Password reset token expired');
    // 3. 更新用户密码
    await this.db
      .update(usersTable)
      .set({ password: await hashString(dto.newPassword) })
      .where(eq(usersTable.id, result.id));
    // 4. 删除 OTP
    await this.db.delete(otpsTable).where(eq(otpsTable.id, otp.id));
  }

  /**
   * @description Change your password
   * @param dto
   * @return Promise<void>
   */
  async changePassword(dto: ChangePasswordDto): Promise<void> {
    const user = await this.validateUser(dto);
    await this.db
      .update(usersTable)
      .set({ password: await hashString(dto.newPassword) })
      .where(eq(usersTable.id, user.id));
    await this.mailService.sendEmail({
      to: [user.email],
      subject: 'Password Change Successful',
      html: ChangePasswordSuccessMail({
        name: user.username ?? '',
      }),
    });
  }

  /**
   * @description Sign Out User Account
   * @param dto
   * @return Promise<void>
   */
  async signOut(dto: SignOutUserDto): Promise<void> {
    // 直接删除 session
    await this.db
      .delete(sessionsTable)
      .where(eq(sessionsTable.id, dto.session_token));
  }

  /**
   * @description Sign Out All Device By User ID
   * @param dto
   * @return Promise<void>
   */
  async signOutAllDevices(dto: SignOutAllDeviceUserDto): Promise<void> {
    await this.db
      .delete(sessionsTable)
      .where(eq(sessionsTable.userId, dto.userId));
  }

  /**
   * @description Refresh User Access Token
   * @param dto
   * @return Promise<RefreshTokenInterface>
   */
  async refreshToken(dto: RefreshTokenDto): Promise<RefreshTokenInterface> {
    // 查找用户
    const result = await this.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, dto.user_id))
      .limit(1)
      .then((rows) => rows[0]);
    if (!result) throw new NotFoundException('User not found');
    const { access_token, refresh_token } = await this.generateTokens(result);
    // 查找 session
    const session = await this.db
      .select()
      .from(sessionsTable)
      .where(
        and(
          eq(sessionsTable.id, dto.session_token),
          eq(sessionsTable.userId, dto.user_id),
        ),
      )
      .limit(1)
      .then((rows) => rows[0]);
    if (!session) throw new NotFoundException('Session not found');
    // 更新 session 的 refreshToken
    await this.db
      .update(sessionsTable)
      .set({ refreshToken: refresh_token })
      .where(eq(sessionsTable.id, dto.session_token));
    const access_token_refresh_time = generateRefreshTime();
    return {
      access_token,
      refresh_token,
      session_token: dto.session_token,
      access_token_refresh_time,
    };
  }

  /**
   * @description Get All Sessions By User ID
   * @param userId
   * @return Promise<InferSelectModel<typeof sessions>[]>
   */
  async getSessions(
    userId: string,
  ): Promise<InferSelectModel<typeof sessionsTable>[]> {
    return await this.db
      .select()
      .from(sessionsTable)
      .where(eq(sessionsTable.userId, userId));
  }

  /**
   * @description Get Session By ID
   * @param id
   * @return Promise<InferSelectModel<typeof sessions>>
   */
  async getSession(
    id: string,
  ): Promise<InferSelectModel<typeof sessionsTable>> {
    const session = await this.db
      .select()
      .from(sessionsTable)
      .where(eq(sessionsTable.id, id))
      .limit(1)
      .then((rows) => rows[0]);
    if (!session) throw new NotFoundException('Session not found!');
    return session;
  }

  async findUserByEmail(email: string) {
    return this.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1)
      .then((rows) => rows[0]);
  }

  async isRegisterOtpLimited(email: string) {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const recentOtps = await this.db
      .select()
      .from(otpsTable)
      .where(
        and(
          eq(otpsTable.type, 'EMAIL_REGISTER'),
          or(eq(otpsTable.userId, email)),
          gt(otpsTable.createdAt, oneHourAgo),
        ),
      );

    return recentOtps.length > 10;
  }

  async sendRegisterEmailOtp(email: string): Promise<void> {
    const now = new Date();

    // 查重
    const existUser = await this.db
      .select()
      .from(usersTable)
      .where(or(eq(usersTable.email, email), eq(usersTable.username, email)))
      .limit(1)
      .then((rows) => rows[0]);

    if (existUser) {
      throw new BadRequestException('该邮箱已注册');
    }

    const otp = generateOTP();
    // 写入 otpsTable
    await this.db.insert(otpsTable).values({
      email: email,
      otp: otp,
      type: 'EMAIL_REGISTER',
      expires: new Date(now.getTime() + 1000 * 60 * 60 * 24),
      createdAt: now,
      updatedAt: now,
    });
    // 发送邮件
    await this.mailService.sendEmail({
      to: [email],
      subject: '注册验证码',
      html: `您的注册验证码是：${otp}，10分钟内有效。`,
    });
  }

  async verifyRegisterEmailOtp(
    email: string,
    otp: string,
  ): Promise<{ id: string; otp: string; type: string; expires: Date }> {
    const record = await this.db
      .select()
      .from(otpsTable)
      .where(
        and(
          eq(otpsTable.userId, email),
          eq(otpsTable.otp, otp),
          eq(otpsTable.type, 'EMAIL_REGISTER'),
        ),
      )
      .limit(1)
      .then((rows) => rows[0]);
    if (!record) throw new BadRequestException('验证码错误');
    if (record.expires && new Date() > record.expires)
      throw new BadRequestException('验证码已过期');
    return record;
  }

  async registerWithEmailOtp(
    dto: CreateUserDto,
  ): Promise<RegisterUserInterface> {
    const { email, password, otp } = dto;
    const otpRecord = await this.verifyRegisterEmailOtp(email, otp);
    //密码强度校验

    // 4. 创建用户
    const now = new Date();
    try {
      return await this.db.transaction(async (trx) => {
        const [user] = await trx
          .insert(usersTable)
          .values({
            email,
            username: email,
            password: await hashString(password),
            isEmailVerified: true, // 已验证
            emailVerifiedAt: now,
            createdAt: now,
            updatedAt: now,
          })
          .returning();

        await trx
          .insert(profilesTable)
          .values({
            userId: user.id,
            username: extractName(email),
            createdAt: now,
            updatedAt: now,
          })
          .returning();

        // 删除验证码
        await trx.delete(otpsTable).where(eq(otpsTable.id, otpRecord.id));

        return { data: user };
      });
    } catch (e) {
      this.logger.error(e);
      throw new BadRequestException('注册异常，请联系管理员');
    }
  }
}
