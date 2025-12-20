import { Router } from 'express';
import { DriftController } from '../controllers/drift.controller';

const router = Router({ mergeParams: true }); // Important: mergeParams allows access to :projectId from parent route

// Route to trigger a drift check
router.post('/check', DriftController.check);

// List drift detections for a project
router.get('/', DriftController.list);

// Get a specific detection detail
router.get('/:detectionId', DriftController.getOne);

// Resolve a detection
router.patch('/:detectionId/resolve', DriftController.resolve);

export default router;