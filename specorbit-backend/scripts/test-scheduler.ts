import { scheduler } from '../src/services/scheduler.service';
import prisma from '../src/lib/prisma';

async function run() {
  // Mock projects
  const origFindMany = prisma.project.findMany;
  (prisma.project as any).findMany = async () => [{ id: 'proj-1' }, { id: 'proj-2' }];

  // Spy on DriftService.checkForDrift via prototype patching
  const driftServiceModule = await import('../src/services/drift.service');
  const origCheck = driftServiceModule.DriftService.prototype.checkForDrift;
  const called: string[] = [];

  driftServiceModule.DriftService.prototype.checkForDrift = async function (projectId: string) {
    called.push(projectId);
    return { projectId, status: 'completed', totalChecks: 0, detections: 0 };
  };

  // Run scheduler once
  await scheduler.runOnce();

  if (called.length !== 2) {
    console.error('Expected 2 checks executed, got', called.length, called);
    process.exit(1);
  }

  console.log('Scheduler executed checks for projects:', called);

  // cleanup
  (prisma.project as any).findMany = origFindMany;
  driftServiceModule.DriftService.prototype.checkForDrift = origCheck;
  process.exit(0);
}

run();