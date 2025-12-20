import { Request, Response } from 'express';
import crypto from 'crypto';
import prisma from '../lib/prisma';
import { GitHubService } from '../services/github.service';
import { SpecService } from '../services/spec.service';
import logger from '../utils/logger';

const specService = new SpecService();

export class WebhookController {
  /**
   * Verifies that the webhook request came from GitHub using HMAC SHA256.
   */
  private static verifySignature(req: Request): boolean {
    const signature = req.headers['x-hub-signature-256'] as string;
    const secret = process.env.GITHUB_WEBHOOK_SECRET;

    if (!signature || !secret) {
      logger.warn('Missing GitHub signature or secret configuration.');
      return false;
    }

    const hmac = crypto.createHmac('sha256', secret);
    const digest = Buffer.from(
      'sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex'),
      'utf8'
    );
    const checksum = Buffer.from(signature, 'utf8');

    return digest.length === checksum.length && crypto.timingSafeEqual(digest, checksum);
  }

  static async handleGitHubEvent(req: Request, res: Response) {
    try {
      const eventType = req.headers['x-github-event'];
      const payload = req.body;

      if (eventType === 'ping') {
        return res.status(200).json({ message: 'Pong!' });
      }

      if (eventType === 'push') {
        // 🛡️ Security: Verify request source
        if (!WebhookController.verifySignature(req)) {
          logger.error('Unauthorized webhook attempt: Invalid HMAC signature.');
          return res.status(401).json({ error: 'Invalid signature' });
        }

        const repoName = payload.repository?.full_name;
        const branch = payload.ref?.replace('refs/heads/', '');

        logger.info(`🔔 Webhook received for ${repoName} (${branch})`);

        const project = await prisma.project.findFirst({
          where: {
            githubRepoUrl: repoName,
            githubBranch: branch
          }
        });

        if (!project) {
          logger.warn(`No project found for repo: ${repoName}`);
          return res.status(200).json({ message: 'Project not monitored' });
        }

        logger.info(`Fetching ${project.entryPath} for project: ${project.name}...`);
        const code = await GitHubService.fetchSourceCode(repoName, branch, project.entryPath);

        // Generate dynamic version
        const dynamicVersion = `1.0.${Date.now()}`;

        logger.info('Parsing code and updating docs...');
        const spec = await specService.generateAndSave(
          project.id,
          code,
          dynamicVersion,
          {                              
            repo: repoName,              
            branch: branch,              
            entryPath: project.entryPath 
          }
        );

        logger.info(`✅ Documentation updated for ${project.name} (v${dynamicVersion})`);
        return res.status(200).json({ message: 'Documentation updated', specId: spec.id });
      }

      res.status(200).json({ message: 'Event ignored' });

    } catch (error: any) {
      logger.error(`Webhook Processing Error: ${error.message}`);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}