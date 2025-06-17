declare namespace Express {
  export interface Request {
    user?: JwtValidateUser;
  }
}
