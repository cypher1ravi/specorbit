import logger from '../utils/logger';
import prisma from '../lib/prisma';
import { addDriftJob, isUsingRedis } from '../queues/drift.queue';

const DEFAULT_INTERVAL_MS = Number(process.env.DRIFT_CHECK_INTERVAL_MS) || 15 * 60 * 1000; // 15 min

export class SchedulerService {
  private intervalId: NodeJS.Timeout | null = null;
  private running = false;

  start(intervalMs: number = DEFAULT_INTERVAL_MS) {
    if (this.running) return;
    logger.info(`Starting SchedulerService (interval: ${intervalMs}ms). Redis mode: ${isUsingRedis()}`);

    // Schedule repeating job
    this.intervalId = setInterval(() => this.enqueueAllProjects(), intervalMs);
    this.running = true;

    // Kickoff immediately
    void this.enqueueAllProjects().catch(err => logger.error('Initial enqueue failed', err));
  }

  stop() {
    if (!this.running) return;
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = null;
    this.running = false;
    logger.info('SchedulerService stopped');
  }

  isRunning() {
    return this.running;
  }

  async enqueueAllProjects() {
    try {
      const projects = await prisma.project.findMany({ select: { id: true } });
      logger.info(`Scheduler: enqueueing ${projects.length} projects for drift checks`);
      for (const p of projects) {
        await addDriftJob(p.id);
      }
    } catch (err) {
      logger.error('Scheduler enqueueAllProjects failed:', err);
    }
  }

  async runOnce() {
    await this.enqueueAllProjects();
  }
}

export const scheduler = new SchedulerService();
