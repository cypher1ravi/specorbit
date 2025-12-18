import { AuthService } from '../src/services/auth.service';
import { AuthController } from '../src/controllers/auth.controller';
import prisma from '../src/lib/prisma';

async function run() {
  const email = `dev+${Date.now()}@example.com`;
  const password = 'password123';
  // 1. Register user via service (this will store refresh token in DB or fallback)
  const { user, accessToken, refreshToken } = await AuthService.register(email, password, 'Dev Test' as any) as any;

  console.log('Registered user:', user.id, user.email);

  // 2. Call refresh controller with cookie
  const req: any = { cookies: { refreshToken } };
  let status = 0;
  let body: any = null;
  const res: any = {
    status: (n: number) => ({ json: (v: any) => { status = n; body = v; return v; } }),
    json: (v: any) => { body = v; return v; },
    cookie: (name: string, val: string, opts: any) => { /* noop */ }
  };

  await AuthController.refresh(req, res);

  console.log('Refresh response status:', status, 'body:', body);

  // cleanup: delete created user
  await prisma.user.delete({ where: { id: user.id } });

  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });