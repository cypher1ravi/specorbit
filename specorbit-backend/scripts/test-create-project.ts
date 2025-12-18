import { ProjectController } from '../src/controllers/project.controller';
import prisma from '../src/lib/prisma';

async function run() {
  try {
    // Mock prisma.project.create
    const originalCreate = prisma.project.create;
    (prisma.project as any).create = async ({ data }: any) => ({ id: 'proj-1', ...data });

    // Fake req/res
    const req: any = { body: { name: 'My New Project' }, user: { userId: 'user-123', teamId: 'team-xyz' } };

    let statusCode = 0;
    let body: any = null;
    const res: any = {
      status: (n: number) => ({ json: (v: any) => { statusCode = n; body = v; return v; } }),
      json: (v: any) => { body = v; return v; }
    };

    await ProjectController.create(req, res);

    if (statusCode !== 201) {
      console.error('Expected 201, got', statusCode, body);
      process.exit(1);
    }

    if (body.teamId !== 'team-xyz') {
      console.error('teamId was not set correctly on created project', body);
      process.exit(1);
    }

    console.log('Project created with teamId from req.user successfully');

    // restore
    (prisma.project as any).create = originalCreate;
    process.exit(0);
  } catch (err) {
    console.error('Test failed', err);
    process.exit(1);
  }
}

run();