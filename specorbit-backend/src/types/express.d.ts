import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        teamId: string;
        role: string;
      };
    }
  }
}