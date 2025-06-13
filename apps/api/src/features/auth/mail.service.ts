import { Injectable } from '@nestjs/common';
import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly config: ConfigService,
  ) {}

  async sendEmail(mailOptions: ISendMailOptions): Promise<void> {
    await this.mailerService.sendMail({
      from: `♻️ Turborepo ⚡ <${this.config.get('MAIL_USERNAME')}>`,
      ...mailOptions,
    });
  }
  // 发送注册验证码
  async sendRegisterCode(email: string, code: string) {
    await this.sendEmail({
      to: [email],
      subject: '注册验证码',
      html: `您的注册验证码是：${code}，10分钟内有效。`,
    });
  }
  // 发送重置密码验证码
  async sendResetPasswordCode(email: string, code: string) {
    await this.sendEmail({
      to: [email],
      subject: '重置密码验证码',
      html: `您的重置密码验证码是：${code}，10分钟内有效。`,
    });
  }
}
