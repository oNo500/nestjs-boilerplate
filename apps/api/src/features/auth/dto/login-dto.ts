import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@example.com', description: 'user email' })
  @IsEmail()
  @IsNotEmpty()
  email: string = '';

  @ApiProperty({ example: 'admin123', description: 'user password' })
  @IsString()
  @IsNotEmpty()
  password: string = '';
}
