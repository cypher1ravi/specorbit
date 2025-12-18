import { Request, Response } from 'express';
import { z } from 'zod';
import { AuthService } from '../services/auth.service';
import logger from '../utils/logger';
import prisma from '../lib/prisma';

// Input Validation Schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export class AuthController {
  
  static async register(req: Request, res: Response) {
    try {
      // Validate input
      const data = registerSchema.parse(req.body);
      console.log(data);
      
      // Call service
      const result = await AuthService.register(data.email, data.password, data.name);

      // Set refresh token in HttpOnly cookie
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/api'
      };
      res.cookie('refreshToken', result.refreshToken, cookieOptions);
      
      res.status(201).json({
        message: 'User registered successfully',
        user: { id: result.user.id, email: result.user.email, name: result.user.name },
        accessToken: result.accessToken
      });
    } catch (error: any) {
      logger.error(`Register Error: ${error.message}`);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error });
      }
      if (error.message === 'User already exists') {
        return res.status(409).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const data = loginSchema.parse(req.body);
      const result = await AuthService.login(data.email, data.password);

      // Set refresh token in HttpOnly cookie
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/api'
      };
      res.cookie('refreshToken', result.refreshToken, cookieOptions);

      res.status(200).json({
        message: 'Login successful',
        user: { id: result.user.id, email: result.user.email, name: result.user.name },
        accessToken: result.accessToken
      });
    } catch (error: any) {
      logger.error(`Login Error: ${error.message}`);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error });
      }
      if (error.message === 'Invalid credentials') {
        return res.status(401).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      const token = req.cookies?.refreshToken;
      if (token) {
        const payload = AuthService.verifyRefreshTokenRaw(token);
        if (payload?.tokenId) {
          await AuthService.revokeRefreshTokenById(payload.tokenId);
        }
      }
    } catch (e) {
      logger.warn('Failed to revoke refresh token on logout', e);
    }

    // Clear refresh token cookie
    res.clearCookie('refreshToken', { path: '/api' });
    res.status(200).json({ message: 'Logged out successfully' });
  }

  // POST /api/auth/refresh
  static async refresh(req: Request, res: Response) {
    try {
      
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) return res.status(401).json({ error: 'No refresh token' });

      const payload = AuthService.verifyRefreshTokenRaw(refreshToken);
      if (!payload || !payload.userId || !payload.tokenId) return res.status(401).json({ error: 'Invalid refresh token' });

      const valid = await AuthService.isRefreshTokenValid(payload.tokenId, refreshToken);
      if (!valid) {
        logger.warn(`Refresh failed: invalid or revoked for tokenId=${payload.tokenId}`);
        return res.status(401).json({ error: 'Refresh token invalid or revoked' });
      }

      const user = await prisma.user.findUnique({ where: { id: payload.userId } });
      
      if (!user) return res.status(401).json({ error: 'User not found' });

      // Rotate: revoke old token and create a new refresh token
      await AuthService.revokeRefreshTokenById(payload.tokenId);

      const tokens = AuthService.generateTokens(user.id);

      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await AuthService.storeRefreshToken(user.id, tokens.refreshTokenId!, tokens.refreshToken, expiresAt);

      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/api'
      };
      res.cookie('refreshToken', tokens.refreshToken, cookieOptions);

      res.json({ accessToken: tokens.accessToken, user: { id: user.id, email: user.email, name: user.name } });
    } catch (err: any) {
      logger.error('Refresh token error:', err);
      // If it's a DB schema issue, give a helpful message
      if (err?.message && err.message.includes('does not exist')) {
        return res.status(500).json({ error: 'Server misconfiguration: Refresh tokens table missing. Run Prisma migrations (e.g. `npx prisma migrate deploy` or `npx prisma migrate dev`) to create it.' });
      }
      res.status(401).json({ error: 'Could not refresh token' });
    }
  }

}