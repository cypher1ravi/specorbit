import { AuthService } from '../src/services/auth.service';
import { authMiddleware } from '../src/middlewares/auth.middleware';
import prisma from '../src/lib/prisma';

async function run() {
  try {
    // 1. Generate tokens
    const { accessToken } = AuthService.generateTokens('user-123');

    // 2. Mock DB response for team membership
    const original = prisma.teamMember.findFirst;
    (prisma.teamMember as any).findFirst = async () => ({ teamId: 'team-xyz', role: 'admin' });

    // 3. Fake req/res
    const req: any = { headers: { authorization: `Bearer ${accessToken}` } };
    const res: any = { status: (n: number) => ({ json: (v: any) => v }) };

    let called = false;
    const next = () => { called = true };

    await authMiddleware(req, res, next as any);

    // 4. Validate
    if (!called) {
      console.error('Middleware did not call next()');
      process.exit(1);
    }
    if (req.user?.userId !== 'user-123' || req.user?.teamId !== 'team-xyz') {
      console.error('Incorrect req.user attached', req.user);
      process.exit(1);
    }

    console.log('Middleware attached teamId correctly');

    // restore
    (prisma.teamMember as any).findFirst = original;
    process.exit(0);
  } catch (err) {
    console.error('Test failed', err);
    process.exit(1);
  }
}

run();