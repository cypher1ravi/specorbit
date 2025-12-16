import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import  prisma from '../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_change_me';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // 1. Verify Token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; teamId: string; role: string };

    // 2. (Optional) Check if user still exists in DB
    // This adds a DB call overhead but increases security
    // const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    // if (!user) throw new Error('User not found');

    // 3. Attach to Request
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};