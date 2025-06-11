import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  // UseGuards,
} from '@nestjs/common';

import { Public } from '@/core/decorators/public.decorators';
// import { JwtRefreshGuard } from '@/core/guards/jwt-refresh.guard';
import { AuthService } from './auth.service';
import { getDeviceInfo } from '@/shared/util/os';

import {
  MessageResponse,
  RefreshTokenResponse,
  SessionResponse,
  SessionsResponse,
  SignInResponse,
} from '@/shared/auth/auth.interface';
import { ChangePasswordDto } from '@/shared/auth/dto/change-password.dto';
import { CreateUserDto } from '@/shared/auth/dto/create-user.dto';
import { ForgotPasswordDto } from '@/shared/auth/dto/forgot-password.dto';
import { RefreshTokenDto } from '@/shared/auth/dto/refresh-token.dto';
import { ResetPasswordDto } from '@/shared/auth/dto/reset-password.dto';
import { SignInUserDto } from '@/shared/auth/dto/signIn-user.dto';
import { SignOutUserDto } from '@/shared/auth/dto/signOut-user.dto';
import { SignOutAllDeviceUserDto } from '@/shared/auth/dto/signOutAllDevice-user.dto';
import { validatePasswordStrength } from '../util/validate/password-strength';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * @description Signs in a user.
   * @param signInUserDto
   * @returns Promise<SignInResponse>
   */
  @Public()
  @Post('login')
  async signIn(
    @Body() signInUserDto: SignInUserDto,
    @Req() request: Request,
  ): Promise<SignInResponse> {
    const userAgent = (request.headers['user-agent'] || '') as string;

    const device = getDeviceInfo(userAgent);
    const data = await this.authService.signIn(signInUserDto, device);
    const { ...result } = data.data; // TODO 移除 password 和 sessions 字段
    return {
      message: 'User signed in successfully',
      data: result,
      tokens: data.tokens,
    };
  }

  /**
   * @description Signs out the user from the current session.
   * @param signOutUserDto
   * @returns Promise<MessageResponse>
   */
  @Post('sign-out')
  async signOut(
    @Body() signOutUserDto: SignOutUserDto,
  ): Promise<MessageResponse> {
    await this.authService.signOut(signOutUserDto);
    return { message: 'User signed out successfully' };
  }

  /**
   * @description Signs out the user from all devices.
   * @param dto
   * @returns {Promise<MessageResponse>}
   */
  @Post('sign-out-allDevices')
  async signOutAllDevices(
    @Body() dto: SignOutAllDeviceUserDto,
  ): Promise<MessageResponse> {
    await this.authService.signOutAllDevices(dto);
    return { message: 'User signed out from all devices successfully' };
  }

  /**
   * @description Retrieves all sessions for a user.
   * @param userId
   * @returns Promise<SessionsResponse>
   */
  @Get('sessions/:userId')
  async sessions(@Param('userId') userId: string): Promise<SessionsResponse> {
    const data = await this.authService.getSessions(userId);
    return { data };
  }

  /**
   * @description Retrieves a session by ID.
   * @param id
   * @returns Promise<SessionResponse>
   */
  @Get('session/:id')
  async session(@Param('id') id: string): Promise<SessionResponse> {
    const data = await this.authService.getSession(id);
    return { data };
  }

  /**
   * @description Sends a password reset email.
   * @param forgotPasswordDto
   * @returns Promise<MessageResponse>
   */
  @Public()
  @Patch('forgot-password')
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<MessageResponse> {
    await this.authService.forgotPassword(forgotPasswordDto);
    return { message: 'Password reset token sent to your email' };
  }

  /**
   * @description Resets the user's password using a token.
   * @param dto
   * @returns Promise<MessageResponse>
   */
  @Public()
  @Patch('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<MessageResponse> {
    const { newPassword, confirmPassword } = dto;
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('两次输入的密码不一致');
    }
    if (!validatePasswordStrength(newPassword)) {
      throw new BadRequestException('密码过于简单');
    }
    await this.authService.resetPassword(dto);
    return { message: 'Password changed successfully' };
  }

  /**
   * @description Changes the user's password.
   * @param dto
   * @returns Promise<MessageResponse>
   */
  @Patch('change-password')
  async changePassword(
    @Body() dto: ChangePasswordDto,
  ): Promise<MessageResponse> {
    const { password, confirmPassword } = dto;
    if (password !== confirmPassword) {
      throw new BadRequestException('两次输入的密码不一致');
    }
    if (!validatePasswordStrength(password)) {
      throw new BadRequestException('密码过于简单');
    }
    await this.authService.changePassword(dto);
    return { message: 'Password changed successfully' };
  }

  /**
   * @description Refreshes the access token using a refresh token.
   * @param  dto
   * @returns Promise<RefreshTokenResponse>
   */
  // @UseGuards(JwtRefreshGuard)
  @Patch('refresh-token')
  async refreshToken(
    @Body() dto: RefreshTokenDto,
  ): Promise<RefreshTokenResponse> {
    const data = await this.authService.refreshToken(dto);
    return {
      message: 'Refresh token generated successfully',
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      access_token_refresh_time: data.access_token_refresh_time,
      session_token: data.session_token,
    };
  }

  @Post('send-email-otp')
  async sendEmailOtp(@Body('email') email: string) {
    // 查重
    const existUser = await this.authService.findUserByEmail(email);
    if (existUser) throw new BadRequestException('该邮箱已注册');
    if (await this.authService.isRegisterOtpLimited(email))
      throw new BadRequestException('注册过于频繁，请稍后再试');
    // 生成并发送验证码
    await this.authService.sendRegisterEmailOtp(email);
    return { message: '验证码已发送' };
  }

  @Post('verify-email-otp')
  async verifyEmailOtp(@Body() dto: { email: string; otp: string }) {
    await this.authService.verifyRegisterEmailOtp(dto.email, dto.otp);
    return { message: '验证码校验通过' };
  }

  @Post('register')
  async register1(@Body() dto: CreateUserDto) {
    const { password, confirmPassword } = dto;

    if (password !== confirmPassword) {
      throw new BadRequestException('两次输入的密码不一致');
    }
    if (!validatePasswordStrength(password)) {
      throw new BadRequestException('密码过于简单');
    }
    return this.authService.registerWithEmailOtp(dto);
  }
}
