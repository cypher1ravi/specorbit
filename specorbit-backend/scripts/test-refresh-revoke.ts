import { AuthService } from '../src/services/auth.service';
import { AuthController } from '../src/controllers/auth.controller';
import prisma from '../src/lib/prisma';
import bcrypt from 'bcrypt';

async function run() {
  const userId = 'user-rot';
  // 1. Generate initial tokens
  const tokens = AuthService.generateTokens(userId);

  // 2. Mock DB behavior: store the existing token record
  const origRT = (prisma as any).refreshToken;
  let stored: any = null;
  let revokeCalledForOldToken = false;

  (prisma as any).refreshToken = {
    findUnique: async ({ where }: any) => {
      if (where.tokenId === tokens.refreshTokenId && stored) return stored;
      return null;
    },
    create: async ({ data }: any) => {
      // create new token record (this simulates rotating to a new token)
      stored = { id: 'rt-1', ...data };
      return stored;
    },
    updateMany: async ({ where, data }: any) => {
      // mark that revoke was called for the old token id
      if (where?.tokenId === tokens.refreshTokenId) {
        revokeCalledForOldToken = true;
      }
      if (stored && where.tokenId === stored.tokenId) {
        stored = { ...stored, ...data };
      }
      return { count: 1 };
    }
  };

  // 3. Pre-populate stored with a hashed token to simulate issuance
  stored = { id: 'rt-1', tokenId: tokens.refreshTokenId, tokenHash: await bcrypt.hash(tokens.refreshToken, 10), userId, revoked: false, expiresAt: new Date(Date.now() + 7*24*60*60*1000) };

  // 4. Mock prisma.user
  const origUserFind = prisma.user.findUnique;
  (prisma.user as any).findUnique = async ({ where }: any) => ({ id: userId, email: 'rot@example.com', name: 'Rot' });

  // 5. Call refresh controller with cookie
  const req: any = { cookies: { refreshToken: tokens.refreshToken } };
  let status = 0;
  let body: any = null;
  const res: any = {
    status: (n: number) => ({ json: (v: any) => { status = n; body = v; return v; } }),
    json: (v: any) => { body = v; return v; },
    cookie: (name: string, val: string, opts: any) => { /* noop */ }
  };

  await AuthController.refresh(req, res);

  // 6. Ensure old token was revoked and rotation happened
  if (!revokeCalledForOldToken) {
    console.error('Old token revoke was not called');
    process.exit(1);
  }

  console.log('Refresh rotation test passed');

  // restore
  (prisma as any).refreshToken = origRT;
  (prisma.user as any).findUnique = origUserFind;

  process.exit(0);
}

run();