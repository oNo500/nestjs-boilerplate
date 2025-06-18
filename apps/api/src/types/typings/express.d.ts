declare namespace Express {
  export interface Request {
    user?: JwtValidateUser;
    x_ip?: string;
  }
}
