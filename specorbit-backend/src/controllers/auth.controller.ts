import { Request, Response } from 'express';
import { z } from 'zod';
import { AuthService } from '../services/auth.service';
import logger from '../utils/logger';

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
      
      res.status(201).json({
        message: 'User registered successfully',
        user: { id: result.user.id, email: result.user.email, name: result.user.name },
        tokens: { accessToken: result.accessToken, refreshToken: result.refreshToken }
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

      res.status(200).json({
        message: 'Login successful',
        user: { id: result.user.id, email: result.user.email, name: result.user.name },
        tokens: { accessToken: result.accessToken, refreshToken: result.refreshToken }
      });
    } catch (error: any) {
      logger.error(`Login Error: ${error.message}`);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error });
      }
      res.status(401).json({ error: 'Invalid credentials' });
    }
  }

  static async logout(req: Request, res: Response) {
    // In a stateful session, you would invalidate the session here.
    // For JWT, the client is responsible for destroying the token.
    // If using refresh tokens, you would invalidate it in the database here.
    res.status(200).json({ message: 'Logged out successfully' });
  }
}