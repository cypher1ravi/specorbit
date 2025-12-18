import bcrypt from 'bcrypt';
import prisma from '../lib/prisma';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';

const SALT_ROUNDS = 10;

// In-memory fallback store used when the DB table is not available (development only)
const inMemoryRefreshStore = new Map<string, { userId: string; tokenHash: string; expiresAt: Date; revoked: boolean }>();

// Token Types
interface Tokens {
  accessToken: string;
  refreshToken: string;
  refreshTokenId?: string;
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
  static generateTokens(userId: string): Tokens {
    // Use a safe fallback to avoid runtime throws when env is missing
    const accessSecret = process.env.JWT_SECRET || 'super_secret_key_change_me';
    const refreshSecret = process.env.REFRESH_TOKEN_SECRET || 'refresh_secret';

    // Use an explicit `userId` field so middleware can read it consistently
    const payload = { userId };

    const accessToken = jwt.sign(payload, accessSecret, { expiresIn: '15m' });

    // Add a tokenId to allow token rotation and revocation
    const refreshTokenId = randomUUID();
    const refreshPayload = { userId, tokenId: refreshTokenId };
    const refreshToken = jwt.sign(refreshPayload, refreshSecret, { expiresIn: '7d' });

    return { accessToken, refreshToken, refreshTokenId };
  }

  // 2. Verify Refresh Token (returns payload or null)
  static verifyRefreshTokenRaw(token: string) {
    try {
      const refreshSecret = process.env.REFRESH_TOKEN_SECRET || 'refresh_secret';
      const decoded = jwt.verify(token, refreshSecret) as { userId: string; tokenId?: string };
      return decoded;
    } catch (err) {
      return null;
    }
  }

// 3. Store hashed refresh token and metadata in DB (falls back to in-memory store when table missing)
  static async storeRefreshToken(userId: string, tokenId: string, refreshToken: string, expiresAt: Date) {
    try {
      const tokenHash = await bcrypt.hash(refreshToken, SALT_ROUNDS);
      return await prisma.refreshToken.create({
        data: {
          tokenId,
          userId,
          tokenHash,
          expiresAt
        }
      });
    } catch (err: any) {
      // If the refresh_tokens table doesn't exist, fall back to a dev-only in-memory store
      if (err?.message && err.message.includes('does not exist')) {
        console.warn('Refresh token table missing; using in-memory refresh store (development only).');
        const tokenHash = await bcrypt.hash(refreshToken, SALT_ROUNDS);
        inMemoryRefreshStore.set(tokenId, { userId, tokenHash, expiresAt, revoked: false });
        return { tokenId, userId, expiresAt } as any;
      }
      throw err;
    }
  }

  // 4. Check whether a refresh token is valid (not revoked & hash matches & not expired)
  static async isRefreshTokenValid(tokenId: string, refreshToken: string) {
    try {
      const record = await prisma.refreshToken.findUnique({ where: { tokenId } });
      if (!record) {
        console.warn(`Refresh validation: no record found for tokenId=${tokenId}`);
        return false;
      }
      if (record.revoked) {
        console.warn(`Refresh validation: tokenId=${tokenId} is revoked`);
        return false;
      }
      if (new Date(record.expiresAt) < new Date()) {
        console.warn(`Refresh validation: tokenId=${tokenId} has expired`);
        return false;
      }
      const matches = await bcrypt.compare(refreshToken, record.tokenHash);
      if (!matches) {
        console.warn(`Refresh validation: tokenId=${tokenId} hash mismatch`);
      }
      return matches;
    } catch (err: any) {
      // If the DB table doesn't exist yet, check in-memory fallback store (development only)
      if (err.message && err.message.includes('does not exist')) {
        console.warn('Refresh token table missing; checking in-memory refresh store (development only).');
        const fallback = inMemoryRefreshStore.get(tokenId);
        if (!fallback) {
          console.warn(`Refresh validation: no in-memory record for tokenId=${tokenId}`);
          return false;
        }
        if (fallback.revoked) {
          console.warn(`Refresh validation: in-memory tokenId=${tokenId} is revoked`);
          return false;
        }
        if (fallback.expiresAt < new Date()) {
          console.warn(`Refresh validation: in-memory tokenId=${tokenId} has expired`);
          return false;
        }
        const matches = await bcrypt.compare(refreshToken, fallback.tokenHash);
        if (!matches) console.warn(`Refresh validation: in-memory tokenId=${tokenId} hash mismatch`);
        return matches;
      }
      throw err;
    }
  }

  // 5. Revoke refresh token by tokenId
  static async revokeRefreshTokenById(tokenId: string) {
    try {
      const res = await prisma.refreshToken.updateMany({ where: { tokenId }, data: { revoked: true } });
      if (res?.count) return res;
      return res;
    } catch (err: any) {
      // If table missing, update in-memory store (dev only)
      if (err?.message && err.message.includes('does not exist')) {
        const rec = inMemoryRefreshStore.get(tokenId);
        if (rec) {
          inMemoryRefreshStore.set(tokenId, { ...rec, revoked: true });
          return { count: 1 };
        }
        return { count: 0 };
      }
      throw err;
    }
  }

  // 2. Verify Refresh Token
  static verifyRefreshToken(token: string) {
    try {
      const refreshSecret = process.env.REFRESH_TOKEN_SECRET || 'refresh_secret';
      const decoded = jwt.verify(token, refreshSecret) as { userId: string };
      return decoded.userId;
    } catch (err) {
      return null;
    }
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

    const tokens = this.generateTokens(user.id);

    // Store refresh token metadata (best-effort: don't fail registration if DB table missing)
    try {
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await this.storeRefreshToken(user.id, tokens.refreshTokenId!, tokens.refreshToken, expiresAt);
    } catch (err: any) {
      console.warn('Warning: could not persist refresh token on register. Proceeding without persistent refresh token.', err?.message || err);
    }

    return { user, ...tokens };
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

    const tokens = this.generateTokens(user.id);

    // Store refresh token metadata (best-effort: don't fail login if DB table missing)
    try {
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await this.storeRefreshToken(user.id, tokens.refreshTokenId!, tokens.refreshToken, expiresAt);
    } catch (err: any) {
      console.warn('Warning: could not persist refresh token on login. Refresh will fail until migrations are applied.', err?.message || err);
    }

    return { user, ...tokens };
  }
  // 4. GitHub OAuth Login
  static async githubLogin(profile: GitHubProfile) {
    const email = profile.emails?.[0]?.value;
    
    if (!email) {
      throw new Error('GitHub account must have a public email');
    }

    // 1. Try finding by GitHub ID
    let user = await prisma.user.findUnique({ 
      where: { githubId: profile.id } 
    });

    // 2. If not found, try finding by Email (link accounts)
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
        // 3. Create new user
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

    const tokens = this.generateTokens(user.id);

    // Store refresh token metadata (best-effort: don't fail oauth login if DB table missing)
    try {
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await this.storeRefreshToken(user.id, tokens.refreshTokenId!, tokens.refreshToken, expiresAt);
    } catch (err: any) {
      console.warn('Warning: could not persist refresh token on oauth login. Proceeding without persistent refresh token.', err?.message || err);
    }

    return { user, ...tokens };
  }
}