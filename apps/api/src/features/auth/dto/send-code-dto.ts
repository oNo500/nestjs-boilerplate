import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class SendCodeDto {
  @ApiProperty()
  @IsEmail()
  email: string;
}
