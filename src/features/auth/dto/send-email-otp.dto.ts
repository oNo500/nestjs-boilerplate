import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class SendEmailOtpDto {
  @ApiProperty()
  @IsEmail()
  email: string;
}
