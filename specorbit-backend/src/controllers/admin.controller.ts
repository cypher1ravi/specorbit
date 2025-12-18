import { Request, Response } from 'express';
import { scheduler } from '../services/scheduler.service';
import logger from '../utils/logger';

export class AdminController {
  static status(req: Request, res: Response) {
    res.json({ running: scheduler.isRunning() });
  }

  static start(req: Request, res: Response) {
    try {
      const interval = req.body.intervalMs ? Number(req.body.intervalMs) : undefined;
      scheduler.start(interval);
      res.json({ message: 'Scheduler started' });
    } catch (err: any) {
      logger.error('Failed to start scheduler', err);
      res.status(500).json({ error: 'Failed to start scheduler' });
    }
  }

  static stop(req: Request, res: Response) {
    try {
      scheduler.stop();
      res.json({ message: 'Scheduler stopped' });
    } catch (err: any) {
      logger.error('Failed to stop scheduler', err);
      res.status(500).json({ error: 'Failed to stop scheduler' });
    }
  }

  static async runNow(req: Request, res: Response) {
    try {
      await scheduler.runOnce();
      res.json({ message: 'Triggered drift checks for all projects' });
    } catch (err: any) {
      logger.error('Failed to run scheduler once', err);
      res.status(500).json({ error: 'Failed to run scheduler' });
    }
  }
}
