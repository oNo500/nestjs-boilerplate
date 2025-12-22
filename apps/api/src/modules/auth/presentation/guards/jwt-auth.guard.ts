import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

/**
 * JWT Authentication Guard
 *
 * Protects routes requiring authentication
 *
 * @example
 * @UseGuards(JwtAuthGuard)
 * @Get('profile')
 * getProfile(@Request() req) {
 *   return req.user;
 * }
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
