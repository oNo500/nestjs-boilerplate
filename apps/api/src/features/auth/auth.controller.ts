import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
} from '@nestjs/common';

import { Public } from '@/common/decorators';

import { LoginDto } from './dto/login-dto';
import { AuthService } from './auth.service';
import { SendCodeDto } from './dto/send-code-dto';
import { MailService } from './mail.service';
import { OptsService } from './opts.service';
import { RegisterDto } from './dto/register-dto';
import { ChangePasswordDto } from './dto/change-password-dto';
import { ResetPasswordDto } from './dto/rest-password';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private mailService: MailService,
    private optsService: OptsService,
  ) {}

  @Public()
  @Post('login')
  async login(@Body() body: LoginDto, @Req() request: Request) {
    const userAgent = request.headers['user-agent'] as string;
    return this.authService.login(body, userAgent);
  }

  @Public()
  @Post('register')
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Post('logout')
  async logout(@Req() request: Request) {
    // TODO: 权限控制的时候统一处理
    const sessionID = request.headers['authorization'] as string;
    await this.authService.logout(sessionID);
    return {
      message: '退出成功',
    };
  }

  // 修改密码
  @Post('change-password')
  async changePassword(
    @Body() body: ChangePasswordDto,
    @Req() request: Request,
  ) {
    const sessionID = request.headers['authorization'] as string;
    // TODO: 权限控制的时候统一处理
    await this.authService.changePassword({ ...body, email: sessionID });
    return {
      message: '修改密码成功',
    };
  }

  // 重置密码
  @Public()
  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordDto) {
    await this.authService.resetPassword(body);
    return {
      message: '重置密码成功',
    };
  }

  // 发送注册验证码
  @Public()
  @Post('send-register-code')
  async sendRegisterCode(@Body() body: SendCodeDto) {
    try {
      const code = await this.optsService.generateOtpCode(
        body.email,
        'EMAIL_REGISTER',
      );
      await this.mailService.sendRegisterCode(body.email, code);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // 发送重置密码验证码
  @Public()
  @Post('send-reset-password-code')
  async sendResetPasswordCode(@Body() body: SendCodeDto) {
    try {
      const code = await this.optsService.generateOtpCode(
        body.email,
        'PASSWORD_RESET',
      );
      await this.mailService.sendResetPasswordCode(body.email, code);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
