import { Request, Response } from 'express';
import { DriftService } from '../services/drift.service';
import logger from '../utils/logger';
import prisma from '../lib/prisma';

const driftService = new DriftService();

export class DriftController {
  /**
   * POST /api/projects/:projectId/drift/check
   * Triggers a drift detection check for a given project.
   */
  static async check(req: Request, res: Response) {
    const { projectId } = req.params;
    logger.info(`Received request to check drift for project ${projectId}`);

    try {
      // In a real application, this would be a long-running background job.
      // For now, we run it directly but won't wait for it to finish.
      driftService.checkForDrift(projectId);

      res.status(202).json({ 
        message: 'Drift detection check has been initiated.' 
      });
    } catch (error: any) {
      logger.error(`Drift check initiation failed for project ${projectId}:`, error);
      res.status(500).json({ error: 'Failed to start drift detection check.' });
    }
  }

  /**
   * GET /api/projects/:projectId/drift
   * Lists drift detections for a given project (paginated)
   */
  static async list(req: Request, res: Response) {
    const { projectId } = req.params;
    const page = Math.max(1, parseInt(String(req.query.page || '1')));
    const limit = Math.min(100, parseInt(String(req.query.limit || '50')));
    const skip = (page - 1) * limit;

    try {
      const detections = await prisma.driftDetection.findMany({
        where: { projectId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      });

      const total = await prisma.driftDetection.count({ where: { projectId } });

      res.json({ page, limit, total, items: detections });
    } catch (err: any) {
      logger.error(`Failed to list drift detections for project ${projectId}:`, err);
      res.status(500).json({ error: 'Failed to retrieve drift detections' });
    }
  }
}
