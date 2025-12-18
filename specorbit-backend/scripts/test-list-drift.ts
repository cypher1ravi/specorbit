import { DriftController } from '../src/controllers/drift.controller';
import prisma from '../src/lib/prisma';

async function run() {
  // 1. Mock prisma.driftDetection.findMany and count
  const originalFindMany = prisma.driftDetection.findMany;
  const originalCount = prisma.driftDetection.count;

  (prisma.driftDetection as any).findMany = async ({ where, orderBy, skip, take }: any) => {
    return [
      { id: 'd-1', projectId: where.projectId, endpointPath: '/a', method: 'GET', discrepancyType: 'changed_response', severity: 'warning', resolved: false, createdAt: new Date() },
      { id: 'd-2', projectId: where.projectId, endpointPath: '/b', method: 'GET', discrepancyType: 'missing_endpoint', severity: 'critical', resolved: false, createdAt: new Date() }
    ].slice(skip, skip + take);
  };

  (prisma.driftDetection as any).count = async ({ where }: any) => 2;

  // 2. Fake req/res
  const req: any = { params: { projectId: 'proj-test' }, query: { page: '1', limit: '10' } };
  let statusCode = 0;
  let body: any = null;
  const res: any = {
    status: (n: number) => ({ json: (v: any) => { statusCode = n; body = v; return v; } }),
    json: (v: any) => { body = v; return v; }
  };

  // 3. Call controller
  await DriftController.list(req, res);

  // 4. Verify
  if (!body || body.total !== 2 || body.items.length !== 2) {
    console.error('Unexpected response:', body);
    process.exit(1);
  }

  console.log('List drift detections test passed');

  // restore
  (prisma.driftDetection as any).findMany = originalFindMany;
  (prisma.driftDetection as any).count = originalCount;

  process.exit(0);
}

run();