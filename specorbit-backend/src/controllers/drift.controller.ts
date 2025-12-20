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
  
  /**
   * GET /api/projects/:projectId/drift/:detectionId
   * Retrieves a single drift detection record.
   */
  static async getOne(req: Request, res: Response) {
    const { detectionId } = req.params;
    try {
      const detection = await prisma.driftDetection.findUnique({
        where: { id: detectionId }
      });
      if (!detection) return res.status(404).json({ error: 'Drift detection not found' });
      res.json(detection);
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve drift detail' });
    }
  }

  /**
   * PATCH /api/projects/:projectId/drift/:detectionId/resolve
   * Updates the resolved status of a drift detection.
   */
  static async resolve(req: Request, res: Response) {
    const { detectionId } = req.params;
    const { resolved } = req.body;
    try {
      const updated = await prisma.driftDetection.update({
        where: { id: detectionId },
        data: { resolved: !!resolved }
      });
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update drift status' });
    }
  }
}
