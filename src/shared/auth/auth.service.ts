import {
  extractName,
  generateOTP,
  generateRefreshTime,
  hashString,
  validateString,
} from '@/shared/util';
import { eq, or, and } from 'drizzle-orm';
import { Env } from '@/config/env';
import {
  AuthTokensInterface,
  LoginUserInterface,
  RefreshTokenInterface,
  RegisterUserInterface,
} from '@/shared/auth/auth.interface';
import {
  ChangePasswordDto,
  ConfirmEmailDto,
  CreateUserDto,
  ForgotPasswordDto,
  RefreshTokenDto,
  ResetPasswordDto,
  SignInUserDto,
  SignOutAllDeviceUserDto,
  SignOutUserDto,
  ValidateUserDto,
} from '@/shared/auth/dto';
import { otps } from '@/database/schema/otps';
import { sessions } from '@/database/schema/sessions';
import { MailService } from '@/shared/mail/mail.service';
import {
  ChangePasswordSuccessMail,
  ConfirmEmailSuccessMail,
  RegisterSuccessMail,
  ResetPasswordMail,
  SignInSuccessMail,
} from '@/shared/mail/templates';
import { profiles } from '@/database/schema/profiles';
import { users } from '@/database/schema/users';
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
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(
        or(eq(users.email, dto.identifier), eq(users.username, dto.identifier)),
      )
      .limit(1)
      .then((rows) => rows[0]);

    if (!result) throw new NotFoundException('User not found');

    const isValid = await validateString(
      dto.password,
      result.users.password ?? '',
    );
    if (!isValid) throw new UnauthorizedException('Invalid credentials');

    return { ...result.profiles, ...result.users };
  }
  /**
   * @description Register user account with email and password
   * @param createUserDto
   * @return Promise<RegisterUserInterface>
   */
  async register(createUserDto: CreateUserDto): Promise<RegisterUserInterface> {
    const email_confirmation_otp = generateOTP(); // generateOTP 返回字符串，无需 await
    const now = new Date();
    try {
      // 1. 插入用户
      const [user] = await this.db
        .insert(users)
        .values({
          email: createUserDto.email,
          username: createUserDto.email,
          password: await hashString(createUserDto.password),
          isEmailVerified: false,
          emailVerifiedAt: null,
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      // 2. 插入 profile
      const [profile] = await this.db
        .insert(profiles)
        .values({
          userId: user.id,
          name: extractName(createUserDto.email),
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      // 3. 插入 OTP
      await this.db.insert(otps).values({
        otp: email_confirmation_otp,
        type: 'EMAIL_CONFIRMATION',
        expires: new Date(now.getTime() + 1000 * 60 * 60 * 24), // 1 day
        createdAt: now,
        updatedAt: now,
      });

      // 4. 发送邮件
      await this.mailService.sendEmail({
        to: [user.email],
        subject: 'Confirm your email',
        html: RegisterSuccessMail({
          name: profile.name,
          otp: email_confirmation_otp,
        }),
      });
      return { data: user };
    } catch (e) {
      this.logger.error(e);
      throw new BadRequestException('Something went wrong!');
    }
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
      const user = (await this.validateUser(dto)) as User & {
        profile?: { name?: string };
      };
      const tokens = await this.generateTokens(user);
      const now = new Date();

      // drizzle-orm 插入 session
      const sessionData = {
        userId: user.id,
        refreshToken: tokens.refresh_token,
        ip: deviceInfo.ip ?? null,
        deviceName: deviceInfo.device_name ?? null,
        deviceOs: deviceInfo.device_os ?? null,
        deviceType: deviceInfo.device_type ?? null,
        browser: deviceInfo.browser ?? null,
        location: deviceInfo.location ?? null,
        userAgent: deviceInfo.userAgent ?? null,
        createdAt: now,
        updatedAt: now,
      };
      const filteredSessionData = Object.fromEntries(
        Object.entries(sessionData).filter(
          ([, v]) => v !== undefined && v !== null,
        ),
      ) as typeof sessionData;
      const [session] = await this.db
        .insert(sessions)
        .values(filteredSessionData)
        .returning();
      await this.mailService.sendEmail({
        to: [user.email],
        subject: 'SignIn with your email',
        html: SignInSuccessMail({
          username: user.profile?.name ?? '',
          loginTime: session.createdAt ?? '',
          ipAddress: session.ip ?? '',
          location: session.location ?? '',
          device: session.deviceName ?? '',
        }),
      });
      const session_refresh_time = generateRefreshTime(); //3 days default
      return {
        data: user,
        tokens: { ...tokens, session_token: session.id, session_refresh_time },
      };
    } catch (error) {
      console.error(error);
      throw new NotFoundException('User not found');
    }
  }

  /**
   * @description Confirm Email Account
   * @param dto
   * @return Promise<void>
   */
  async confirmEmail(dto: ConfirmEmailDto): Promise<void> {
    // 1. 查找用户
    const user = await this.db
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
        password: users.password,
        isEmailVerified: users.isEmailVerified,
        emailVerifiedAt: users.emailVerifiedAt,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        profileName: profiles.name,
      })
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(eq(users.email, dto.email))
      .limit(1)
      .then((rows) => rows[0]);
    if (!user) throw new NotFoundException('User not found');
    // 2. 查找 OTP
    const otp = await this.db
      .select()
      .from(otps)
      .where(and(eq(otps.otp, dto.token), eq(otps.type, 'EMAIL_CONFIRMATION')))
      .limit(1)
      .then((rows) => rows[0]);
    if (!otp) throw new NotFoundException('Invalid confirmation code');
    if (otp.otp !== dto.token)
      throw new BadRequestException('Invalid confirmation code');
    if (otp.expires && new Date(otp.expires) < new Date())
      throw new BadRequestException('Email confirm token expired');
    // 3. 更新用户
    await this.db
      .update(users)
      .set({ isEmailVerified: true, emailVerifiedAt: new Date() })
      .where(eq(users.id, user.id));
    // 4. 删除 OTP
    await this.db.delete(otps).where(eq(otps.id, otp.id));
    // 5. 发送邮件
    await this.mailService.sendEmail({
      to: [user.email],
      subject: 'Confirmation Successful',
      html: ConfirmEmailSuccessMail({
        name: user.profileName ?? '',
      }),
    });
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
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(
        or(eq(users.email, dto.identifier), eq(users.username, dto.identifier)),
      )
      .limit(1)
      .then((rows) => rows[0]);
    if (!result) throw new NotFoundException('User not found');
    // 2. 生成 OTP
    const passwordResetToken = generateOTP();
    const now = new Date();
    await this.db.insert(otps).values({
      otp: passwordResetToken,
      type: 'PASSWORD_RESET',
      expires: new Date(now.getTime() + 1000 * 60 * 60 * 24),
      createdAt: now,
      updatedAt: now,
    });
    // 3. 发送邮件
    await this.mailService.sendEmail({
      to: [result.users.email],
      subject: 'Reset your password',
      html: ResetPasswordMail({
        name: result?.profiles?.name ?? '',
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
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(
        or(eq(users.email, dto.identifier), eq(users.username, dto.identifier)),
      )
      .limit(1)
      .then((rows) => rows[0]);
    if (!result) throw new NotFoundException('User not found');
    // 2. 查找 OTP
    const otp = await this.db
      .select()
      .from(otps)
      .where(and(eq(otps.otp, dto.resetToken), eq(otps.type, 'PASSWORD_RESET')))
      .limit(1)
      .then((rows) => rows[0]);
    if (!otp) throw new NotFoundException('Invalid password reset token');
    if (otp.otp !== dto.resetToken)
      throw new BadRequestException('Invalid password reset token');
    if (otp.otp && new Date() > otp.expires)
      throw new BadRequestException('Password reset token expired');
    // 3. 更新用户密码
    await this.db
      .update(users)
      .set({ password: await hashString(dto.newPassword) })
      .where(eq(users.id, result.users.id));
    // 4. 删除 OTP
    await this.db.delete(otps).where(eq(otps.id, otp.id));
    // 5. 发送邮件
    await this.mailService.sendEmail({
      to: [result.users.email],
      subject: 'Password Reset Successful',
      html: ChangePasswordSuccessMail({
        name: result.profiles?.name ?? '',
      }),
    });
  }

  /**
   * @description Change your password
   * @param dto
   * @return Promise<void>
   */
  async changePassword(dto: ChangePasswordDto): Promise<void> {
    const user = await this.validateUser(dto);
    await this.db
      .update(users)
      .set({ password: await hashString(dto.newPassword) })
      .where(eq(users.id, user.id));
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
    await this.db.delete(sessions).where(eq(sessions.id, dto.session_token));
  }

  /**
   * @description Sign Out All Device By User ID
   * @param dto
   * @return Promise<void>
   */
  async signOutAllDevices(dto: SignOutAllDeviceUserDto): Promise<void> {
    await this.db.delete(sessions).where(eq(sessions.userId, dto.userId));
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
      .from(users)
      .where(eq(users.id, dto.user_id))
      .limit(1)
      .then((rows) => rows[0]);
    if (!result) throw new NotFoundException('User not found');
    const { access_token, refresh_token } = await this.generateTokens(result);
    // 查找 session
    const session = await this.db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.id, dto.session_token),
          eq(sessions.userId, dto.user_id),
        ),
      )
      .limit(1)
      .then((rows) => rows[0]);
    if (!session) throw new NotFoundException('Session not found');
    // 更新 session 的 refreshToken
    await this.db
      .update(sessions)
      .set({ refreshToken: refresh_token })
      .where(eq(sessions.id, dto.session_token));
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
  ): Promise<InferSelectModel<typeof sessions>[]> {
    return await this.db
      .select()
      .from(sessions)
      .where(eq(sessions.userId, userId));
  }

  /**
   * @description Get Session By ID
   * @param id
   * @return Promise<InferSelectModel<typeof sessions>>
   */
  async getSession(id: string): Promise<InferSelectModel<typeof sessions>> {
    const session = await this.db
      .select()
      .from(sessions)
      .where(eq(sessions.id, id))
      .limit(1)
      .then((rows) => rows[0]);
    if (!session) throw new NotFoundException('Session not found!');
    return session;
  }
}
