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
    
    // ENCODE DATA FOR URL
    const accessToken = data.accessToken;
    const refreshToken = data.refreshToken;
    const user = encodeURIComponent(JSON.stringify(data.user));

    // REDIRECT TO FRONTEND
    // Note: In production, use an environment variable for the frontend URL
    res.redirect(`http://localhost:5173/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}&user=${user}`);
  }
);

export default router;