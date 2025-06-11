import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  // UseGuards,
} from '@nestjs/common';

import { Public } from '@/core/decorators/public.decorators';
// import { JwtRefreshGuard } from '@/core/guards/jwt-refresh.guard';
import { AuthService } from './auth.service';
import { getDeviceInfo } from '@/shared/util/os';
import { validatePasswordStrength } from '../util/validate/password-strength';

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
import { SendEmailOtpDto } from './dto/send-email-otp.dto';
import { VerifyEmailOtpDto } from './dto/verify-email-otp.dto';
import { JwtRefreshGuard } from '@/core/guards';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 用户登录
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
      message: '登录成功',
      data: result,
      tokens: data.tokens,
    };
  }

  /**
   * 用户注册（邮箱+验证码）
   */
  @Post('register')
  async register(@Body() dto: CreateUserDto) {
    this.checkPassword(dto.password, dto.confirmPassword);
    return this.authService.registerWithEmailOtp(dto);
  }

  /**
   * 发送注册邮箱验证码
   */
  @Post('send-email-otp')
  async sendEmailOtp(@Body() dto: SendEmailOtpDto) {
    const { email } = dto;
    const existUser = await this.authService.findUserByEmail(email);
    if (existUser) throw new BadRequestException('该邮箱已注册');
    if (await this.authService.isRegisterOtpLimited(email))
      throw new BadRequestException('注册过于频繁，请稍后再试');
    await this.authService.sendRegisterEmailOtp(email);
    return { message: '验证码已发送' };
  }

  /**
   * 校验注册邮箱验证码
   */
  @Post('verify-email-otp')
  async verifyEmailOtp(@Body() dto: VerifyEmailOtpDto) {
    await this.authService.verifyRegisterEmailOtp(dto);
    return { message: '验证码校验通过' };
  }

  /**
   * 当前设备登出
   */
  @Post('sign-out')
  async signOut(
    @Body() signOutUserDto: SignOutUserDto,
  ): Promise<MessageResponse> {
    await this.authService.signOut(signOutUserDto);
    return { message: '退出登录成功' };
  }

  /**
   * 所有设备登出
   */
  @Post('sign-out-allDevices')
  async signOutAllDevices(
    @Body() dto: SignOutAllDeviceUserDto,
  ): Promise<MessageResponse> {
    await this.authService.signOutAllDevices(dto);
    return { message: '所有设备已退出登录' };
  }

  /**
   * 获取用户所有会话
   */
  @Get('sessions/:userId')
  async sessions(@Param('userId') userId: string): Promise<SessionsResponse> {
    const data = await this.authService.getSessions(userId);
    return { data };
  }

  /**
   * 获取单个会话
   */
  @Get('session/:id')
  async session(@Param('id') id: string): Promise<SessionResponse> {
    const data = await this.authService.getSession(id);
    return { data };
  }

  /**
   * 发送重置密码邮件
   */
  @Public()
  @Patch('forgot-password')
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<MessageResponse> {
    await this.authService.forgotPassword(forgotPasswordDto);
    return { message: '重置密码邮件已发送' };
  }

  /**
   * 重置密码（通过token）
   */
  @Public()
  @Patch('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<MessageResponse> {
    this.checkPassword(dto.newPassword, dto.confirmPassword);
    await this.authService.resetPassword(dto);
    return { message: '密码重置成功' };
  }

  /**
   * 修改密码
   */
  @Patch('change-password')
  async changePassword(
    @Body() dto: ChangePasswordDto,
  ): Promise<MessageResponse> {
    this.checkPassword(dto.password, dto.confirmPassword);
    await this.authService.changePassword(dto);
    return { message: '密码修改成功' };
  }

  /**
   * 刷新token
   */
  @UseGuards(JwtRefreshGuard)
  @Patch('refresh-token')
  async refreshToken(
    @Body() dto: RefreshTokenDto,
  ): Promise<RefreshTokenResponse> {
    const data = await this.authService.refreshToken(dto);
    return {
      message: '刷新token成功',
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      access_token_refresh_time: data.access_token_refresh_time,
      session_token: data.session_token,
    };
  }

  /**
   * 校验密码一致性和强度
   */
  private checkPassword(password: string, confirmPassword: string) {
    if (password !== confirmPassword) {
      throw new BadRequestException('两次输入的密码不一致');
    }
    if (!validatePasswordStrength(password)) {
      throw new BadRequestException('密码过于简单');
    }
  }
}
