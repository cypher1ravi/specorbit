import { Router } from 'express';
import passport from 'passport'; 
import { AuthController } from '../controllers/auth.controller';
import '../config/passport'; 
const router = Router();

// Email/Password
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// GitHub OAuth
// 1. Redirect to GitHub
router.get('/github', passport.authenticate('github', { session: false }));

// 2. Callback from GitHub
router.get(
  '/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    // req.user contains the { user, accessToken, refreshToken } from AuthService
    const data = req.user as any;
    
    // In a real app, you redirect to frontend with tokens in URL parameters or a cookie
    // For MVP testing, we just return JSON
    res.json({
      message: 'GitHub Login Successful',
      tokens: {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken
      },
      user: data.user
    });
  }
);

export default router;