import { Request, Response } from 'express';
import { DriftService } from '../services/drift.service';
import logger from '../utils/logger';

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
}
