import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';

const router = Router();

// GET /api/admin/drift/status
router.get('/drift/status', AdminController.status);
// POST /api/admin/drift/start
router.post('/drift/start', AdminController.start);
// POST /api/admin/drift/stop
router.post('/drift/stop', AdminController.stop);
// POST /api/admin/drift/run
router.post('/drift/run', AdminController.runNow);

export default router;
