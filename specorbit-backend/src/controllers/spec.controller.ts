import { Request, Response } from 'express';
import { SpecService } from '../services/spec.service';
import prisma from '../lib/prisma';
import logger from '../utils/logger';
import { GitHubService } from '../services/github.service';

const specService = new SpecService();

export class SpecController {

  // POST /api/projects/:projectId/sync
  static async sync(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      
      // Optional: Allow user to specify branch in body, otherwise default to 'main'
      const branch = req.body.branch || 'main';

      // 1. Fetch Project Details
      const project = await prisma.project.findUnique({
        where: { id: projectId }
      });

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      if (!project.githubRepoUrl || !project.entryPath) {
        return res.status(400).json({ error: 'Project missing GitHub configuration' });
      }

      logger.info(`🔄 Manual sync triggered for ${project.name} on branch ${branch}`);

      // 2. Fetch the Entry File Code
      // We reuse the GitHubService to get the raw content of app.ts/index.ts
      let entryCode: string;
      try {
        entryCode = await GitHubService.fetchSourceCode(
          project.githubRepoUrl,
          branch,
          project.entryPath
        );
      } catch (err) {
        logger.error(`Failed to fetch entry file from GitHub: ${err}`);
        return res.status(400).json({ error: 'Failed to fetch code from GitHub. Check repo URL and privacy settings.' });
      }

      // 3. Generate and Save Spec
      // Passing the 4th param (repoContext) enables recursive parsing
      const newVersion = `1.0.${Date.now()}`;
      
      const spec = await specService.generateAndSave(
        project.id,
        entryCode,
        newVersion,
        {
          repo: project.githubRepoUrl,
          branch: branch,
          entryPath: project.entryPath
        }
      );

      return res.json({ 
        message: 'Sync successful', 
        specId: spec.id,
        routesFound: spec.specJson && (spec.specJson as any).paths ? Object.keys((spec.specJson as any).paths).length : 0
      });

    } catch (error) {
      logger.error('Manual Sync Error:', error);
      return res.status(500).json({ error: 'Internal server error during sync' });
    }
  }

  // GET /api/projects/:projectId/specs/latest
  static async getLatest(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const spec = await prisma.openAPISpec.findFirst({
        where: { projectId },
        orderBy: { createdAt: 'desc' },
      });

      if (!spec) {
        return res.status(404).json({ error: 'No specification found for this project.' });
      }
      res.json(spec);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve latest spec' });
    }
  }

  // GET /api/projects/:projectId/specs
  static async listSpecs(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const specs = await prisma.openAPISpec.findMany({
        where: { projectId },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          version: true,
          createdAt: true,
          isPublished: true
        }
      });
      res.json(specs);
    } catch (error) {
      res.status(500).json({ error: 'Failed to list specs' });
    }
  }

  // GET /api/specs/:specId
  static async getSpec(req: Request, res: Response) {
    try {
      const { specId } = req.params;
      const spec = await prisma.openAPISpec.findUnique({
        where: { id: specId }
      });

      if (!spec) return res.status(404).json({ error: 'Spec not found' });
      res.json(spec);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve spec' });
    }
  }
}