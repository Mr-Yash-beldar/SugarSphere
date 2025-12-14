declare module 'morgan';
declare module 'multer';
declare module 'bcryptjs';
declare module 'nodemailer';
declare module 'jsonwebtoken' {
  import type { JwtPayload as _JwtPayload } from './types';
  const verify: any;
  const sign: any;
  const TokenExpiredError: any;
  const JsonWebTokenError: any;
  export { verify, sign, TokenExpiredError, JsonWebTokenError };
}

// Minimal augmentation for Express Request so code referencing body/params/query/file/headers/user compiles
import type { IUser } from '../models';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      file?: any;
      body?: any;
      params?: any;
      query?: any;
      headers?: any;
    }
  }
}

export {};
