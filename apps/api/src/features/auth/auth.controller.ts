import { BadRequestException, Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';

import { Public } from '@/common/decorators';
import { Device, DeviceType } from '@/common/decorators/device.decorator';
import { LocalAuthGuard } from '@/common/guards/local-auth.guard';

import { LoginDto } from './dto/login-dto';
import { AuthService } from './auth.service';
import { SendCodeDto } from './dto/send-code-dto';
import { MailService } from './mail.service';
import { OptsService } from './opts.service';
import { RegisterDto } from './dto/register-dto';
import { ChangePasswordDto } from './dto/change-password-dto';
import { ResetPasswordDto } from './dto/rest-password';
import { User } from './auth.interface';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private mailService: MailService,
    private optsService: OptsService,
  ) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Body() body: LoginDto, @Device() device: DeviceType, @Req() request: Request) {
    const user = request.user as User;
    return {
      ...(await this.authService.login(user, device)),
      user: user,
    };
  }

  @Public()
  @Post('register')
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Post('logout')
  async logout(@Req() request: Request) {
    const sessionID = request.headers['authorization'] as string;
    await this.authService.logout(sessionID);
    return 'Logout successfully';
  }

  @Post('change-password')
  async changePassword(@Body() body: ChangePasswordDto, @Req() request: Request) {
    const sessionID = request.headers['authorization'] as string;
    // TODO: 权限控制的时候统一处理
    await this.authService.changePassword({ ...body, email: sessionID });
    return 'Change password successfully';
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordDto) {
    await this.authService.resetPassword(body);
    return 'Reset password successfully';
  }

  @Public()
  @Post('send-register-code')
  async sendRegisterCode(@Body() body: SendCodeDto) {
    try {
      const code = await this.optsService.generateOtpCode(body.email, 'EMAIL_REGISTER');
      await this.mailService.sendRegisterCode(body.email, code);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Public()
  @Post('send-reset-password-code')
  async sendResetPasswordCode(@Body() body: SendCodeDto) {
    try {
      const code = await this.optsService.generateOtpCode(body.email, 'PASSWORD_RESET');
      await this.mailService.sendResetPasswordCode(body.email, code);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
