export interface AuthTokensInterface {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  sub: string;
  role: string;
  exp?: number;
  iat?: number; // expiresIn 配置会自动添加 exp、iat
}

export interface JwtValidateUser {
  userId: string;
  role: string;
}
