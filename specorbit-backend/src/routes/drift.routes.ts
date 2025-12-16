import { Router } from 'express';
import { DriftController } from '../controllers/drift.controller';

const router = Router();

// Route to trigger a drift check
router.post('/check', DriftController.check);

export default router;
