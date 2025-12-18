import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';
import { SpecController } from '../controllers/spec.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import driftRoutes from './drift.routes';

const router = Router();

// --- Projects ---
router.get('/projects', ProjectController.list);
router.post('/projects', ProjectController.create);
router.get('/projects/:id', ProjectController.getOne);
router.put('/projects/:id', ProjectController.update);

// --- Specs ---
router.post('/projects/:projectId/sync', SpecController.sync);
router.get('/projects/:projectId/specs/latest', SpecController.getLatest);
router.get('/projects/:projectId/specs', SpecController.listSpecs);
router.get('/specs/:specId', SpecController.getSpec);

// --- Drift ---
router.use('/projects/:projectId/drift', driftRoutes);

export default router;
