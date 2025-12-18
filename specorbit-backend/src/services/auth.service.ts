import bcrypt from 'bcrypt';
import prisma from '../lib/prisma';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = 10;

// Token Types
interface Tokens {
  accessToken: string;
  refreshToken: string;
}
// GitHub Profile Interface
interface GitHubProfile {
  id: string;
  username: string;
  displayName: string;
  emails?: { value: string }[];
  photos?: { value: string }[];
}

export class AuthService {
  // 1. Generate Access & Refresh Tokens
  static generateTokens(userId: string,teamId:string): Tokens {
    const accessToken = jwt.sign(
      { sub: userId,teamId },
      process.env.JWT_SECRET as string,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { sub: userId },
      process.env.REFRESH_TOKEN_SECRET || 'refresh_secret',
      { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
  }

  // Helper to exclude password hash
  private static omitPassword(user: any) {
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // 2. Register New User
  static async register(email: string, password: string, name?: string) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error('User already exists');
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
      },
    });

    return { user: this.omitPassword(user), ...this.generateTokens(user.id) };
  }

  // 3. Login User
  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      throw new Error('Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    return { user: this.omitPassword(user), ...this.generateTokens(user.id) };
  }
  // 4. GitHub OAuth Login
  static async githubLogin(profile: GitHubProfile) {
    // Use public email or generate a placeholder
    const email = profile.emails?.[0]?.value || `${profile.id}@users.noreply.github.com`;

    // 1. Try finding by GitHub ID
    let user = await prisma.user.findUnique({ 
      where: { githubId: profile.id } 
    });

    // 2. If not found by githubId, try finding by Email to link accounts
    if (!user) {
      user = await prisma.user.findUnique({ 
        where: { email } 
      });

      if (user) {
        // Link existing email user to GitHub
        user = await prisma.user.update({
          where: { id: user.id },
          data: { 
            githubId: profile.id,
            githubUsername: profile.username,
            profileImage: profile.photos?.[0]?.value
          }
        });
      } else {
        // 3. Create new user if not found by email either
        user = await prisma.user.create({
          data: {
            email,
            name: profile.displayName || profile.username,
            githubId: profile.id,
            githubUsername: profile.username,
            profileImage: profile.photos?.[0]?.value,
            // No passwordHash needed for OAuth users
          }
        });
      }
    }

    return { user: this.omitPassword(user), ...this.generateTokens(user.id) };
  }
}