import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { GitHubService } from '../services/github.service';
import { SpecService } from '../services/spec.service';
import logger from '../utils/logger';

const specService = new SpecService();

export class WebhookController {
  
  static async handleGitHubEvent(req: Request, res: Response) {
    try {
      const eventType = req.headers['x-github-event'];
      const payload = req.body;

      if (eventType === 'ping') {
        return res.status(200).json({ message: 'Pong!' });
      }

      if (eventType === 'push') {
        const repoName = payload.repository?.full_name; // e.g. "username/repo"
        const branch = payload.ref?.replace('refs/heads/', ''); // e.g. "main"

        logger.info(`🔔 Webhook received for ${repoName} (${branch})`);

        // 1. Find Project linked to this Repo
        const project = await prisma.project.findFirst({
          where: { 
            githubRepoUrl: repoName, // Match the field in DB
            githubBranch: branch 
          }
        });

        if (!project) {
          logger.warn(`No project found for repo: ${repoName}`);
          return res.status(200).json({ message: 'Project not monitored' });
        }

        // 2. Fetch Code from GitHub
        logger.info(`Fetching source code for project: ${project.name}...`);
        const code = await GitHubService.fetchSourceCode(repoName, branch);

        // 3. Generate & Save Spec
        logger.info('Parsing code and updating docs...');
        const spec = await specService.generateAndSave(project.id, code, '1.0.2'); // Auto-increment version in future

        logger.info(`✅ Documentation updated for ${project.name}`);
        return res.status(200).json({ message: 'Documentation updated', specId: spec.id });
      }

      res.status(200).json({ message: 'Event ignored' });

    } catch (error: any) {
      logger.error(`Webhook Processing Error: ${error.message}`);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}