import 'express';

declare global {
  namespace Express {
    interface UserPayload {
      email: string;
    }

    interface Request {
      user?: UserPayload;
    }
  }
}
