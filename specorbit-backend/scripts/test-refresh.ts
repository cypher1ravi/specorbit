import { AuthService } from '../src/services/auth.service';
import { AuthController } from '../src/controllers/auth.controller';
import prisma from '../src/lib/prisma';

async function run() {
  // Mock a refresh token and a user in DB
  const userId = 'user-123';
  const tokens = AuthService.generateTokens(userId);

  const origFind = prisma.user.findUnique;
  (prisma.user as any).findUnique = async ({ where }: any) => ({ id: userId, email: 'test@example.com', name: 'Test' });

  // Mock req/res
  const req: any = { cookies: { refreshToken: tokens.refreshToken } };
  let code = 0;
  let body: any = null;
  const res: any = {
    status: (n: number) => ({ json: (v: any) => { code = n; body = v; return v; } }),
    json: (v: any) => { body = v; return v; },
    cookie: (name: string, val: string, opts: any) => { /* noop */ }
  };

  await AuthController.refresh(req, res);

  if (!body || !body.accessToken || !body.user) {
    console.error('Refresh failed', code, body);
    process.exit(1);
  }

  console.log('Refresh endpoint logic OK', body.user.email);

  (prisma.user as any).findUnique = origFind;
  process.exit(0);
}

run();