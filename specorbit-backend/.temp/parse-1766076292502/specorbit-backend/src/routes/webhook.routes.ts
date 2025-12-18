import { Router } from 'express';
import { WebhookController } from '../controllers/webhook.controller';

const router = Router();

// GitHub sends POST requests
router.post('/github', WebhookController.handleGitHubEvent);

export default router;