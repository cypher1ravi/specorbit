import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2'; 
import { AuthService } from '../services/auth.service';
import logger from '../utils/logger';

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      callbackURL: process.env.GITHUB_CALLBACK_URL || '',
      scope: ['user:email'], // Request email permission
    },
    async (accessToken: string, refreshToken: string, profile: any, done: Function) => {
      try {
        const result = await AuthService.githubLogin(profile);
        return done(null, result);
      } catch (error) {
        logger.error('GitHub Auth Error:', error);
        return done(error, null);
      }
    }
  )
);

export default passport;