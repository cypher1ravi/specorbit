import express from 'express';
import { DriftService } from '../src/services/drift.service';
import prisma from '../src/lib/prisma';

async function run() {
  // 1. Start a small test server with deterministic endpoints
  const app = express();
  app.get('/hello', (req, res) => res.json({ message: 'ok' }));
  app.get('/bad', (req, res) => res.status(500).json({ error: 'server error' }));
  app.get('/missing', (req, res) => res.status(404).json({ error: 'not found' }));

  const server = app.listen(0, async () => {
    const port = (server.address() as any).port;
    const baseUrl = `http://localhost:${port}`;

    // 2. Mock DB & spec retrieval
    const origProj = prisma.project.findUnique;
    const origSpec = prisma.openAPISpec.findFirst;
    const created: any[] = [];

    (prisma.project as any).findUnique = async () => ({ id: 'proj-test', name: 'TestProj', baseUrl });

    (prisma.openAPISpec as any).findFirst = async () => ({
      id: 'spec-1',
      projectId: 'proj-test',
      specJson: {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/hello': { get: { responses: { '200': { description: 'OK' } } } },
          '/bad': { get: { responses: { '200': { description: 'OK' } } } },
          '/missing': { get: { responses: { '200': { description: 'OK' } } } }
        }
      }
    });

    (prisma.driftDetection as any).create = async ({ data }: any) => {
      const record = { id: `d-${created.length + 1}`, ...data };
      created.push(record);
      return record;
    };

    // 3. Run the drift checker
    try {
      const svc = new DriftService();
      const res = await svc.checkForDrift('proj-test');

      console.log('Summary:', res);
      console.log('Detections created:', created.length);

      if (created.length !== 2) {
        console.error('Expected 2 detections for /bad and /missing');
        process.exit(1);
      }

      console.log('Drift detection test passed');
      process.exit(0);
    } catch (err) {
      console.error('Test failed', err);
      process.exit(1);
    } finally {
      // restore
      (prisma.project as any).findUnique = origProj;
      (prisma.openAPISpec as any).findFirst = origSpec;
      server.close();
    }
  });
}

run();