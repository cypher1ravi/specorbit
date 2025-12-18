import { Router } from 'express';
import passport from 'passport'; 
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import '../config/passport'; 
const router = Router();

// Email/Password
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// Logout
router.post('/logout', AuthController.logout);

// GitHub OAuth
// 1. Redirect to GitHub
router.get('/github', passport.authenticate('github', { session: false }));

// 2. Callback from GitHub
router.get(
  '/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    const data = req.user as any;

    // Set refresh token cookie and redirect to frontend callback page. Frontend will call /auth/refresh to obtain access token and user.
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api'
    };

    res.cookie('refreshToken', data.refreshToken, cookieOptions);

    // Redirect to frontend callback (no tokens in URL)
    res.redirect(process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/auth/callback` : 'http://localhost:5173/auth/callback');
  }
);

// Refresh token endpoint
router.post('/refresh', AuthController.refresh);
// Logout
router.post('/logout', AuthController.logout);
// (old routes kept)

export default router;