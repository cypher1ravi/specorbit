import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';
import { SpecController } from '../controllers/spec.controller';
import authRoutes from './auth.routes';
import webhookRoutes from './webhook.routes';

const router = Router();

// --- Modules ---
router.use('/auth', authRoutes);
router.use('/webhooks', webhookRoutes);

// --- Projects ---
router.get('/projects', ProjectController.list);
router.post('/projects', ProjectController.create);
router.get('/projects/:id', ProjectController.getOne);

// --- Specs ---
router.post('/projects/:id/sync', SpecController.sync);
router.get('/projects/:id/specs/latest', SpecController.getLatest);

export default router;