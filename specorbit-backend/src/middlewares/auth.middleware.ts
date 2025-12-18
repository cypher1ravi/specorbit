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
    // 1. Verify Token (must contain at least userId)
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    // 2. Fetch primary team membership for the user (if any)
    // This adds a DB call but ensures downstream code can rely on `req.user.teamId`
    const membership = await prisma.teamMember.findFirst({ where: { userId: decoded.userId } });

    // 3. Attach to Request (teamId/role may be undefined)
    req.user = {
      userId: decoded.userId,
      teamId: membership?.teamId,
      role: membership?.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};