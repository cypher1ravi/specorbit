import { Request, Response } from 'express';
import crypto from 'crypto';
import logger from '../utils/logger';

export class WebhookController {
  
  static async handleGitHubEvent(req: Request, res: Response) {
    try {
      const eventType = req.headers['x-github-event'];
      const signature = req.headers['x-hub-signature-256'] as string;
      const payload = req.body;

      // 1. Basic Logging (We will add signature verification later)
      logger.info(`Received GitHub Event: ${eventType}`);

      if (eventType === 'ping') {
        return res.status(200).json({ message: 'Pong! Webhook is working.' });
      }

      if (eventType === 'push') {
        const repoName = payload.repository?.full_name;
        const branch = payload.ref?.replace('refs/heads/', '');
        const commitId = payload.head_commit?.id;

        logger.info(`🚀 Code pushed to ${repoName} on branch ${branch}`);
        logger.info(`Commit: ${commitId}`);

        // TODO: In the future, we will trigger a background job here:
        // await Queue.add('sync-documentation', { repoName, branch, commitId });

        return res.status(200).json({ message: 'Sync triggered successfully' });
      }

      // Ignore other events for now
      return res.status(200).json({ message: `Event ${eventType} ignored` });

    } catch (error: any) {
      logger.error(`Webhook Error: ${error.message}`);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}