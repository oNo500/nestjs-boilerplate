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

  async sendRegisterCode(email: string, code: string) {
    await this.sendEmail({
      to: [email],
      subject: 'Register Verification Code',
      html: `Your register verification code is: ${code}, valid for 10 minutes.`,
    });
  }

  async sendResetPasswordCode(email: string, code: string) {
    await this.sendEmail({
      to: [email],
      subject: 'Reset Password Verification Code',
      html: `Your reset password verification code is: ${code}, valid for 10 minutes.`,
    });
  }
}
