import Queue from 'bull';
import logger from '../utils/logger';
import { DriftService } from '../services/drift.service';

const REDIS_URL = process.env.REDIS_URL;
const driftService = new DriftService();

export type DriftJobData = { projectId: string };

let queue: Queue.Queue | null = null;
let useRedis = false;

if (REDIS_URL) {
  try {
    queue = new Queue('drift-checks', REDIS_URL);
    useRedis = true;
    logger.info('Using Redis-backed Bull queue for drift checks');
  } catch (err) {
    logger.warn('Failed to initialize Redis Bull queue, falling back to in-memory execution', err);
    queue = null;
    useRedis = false;
  }
} else {
  logger.info('No REDIS_URL provided; using in-memory scheduler fallback for drift checks');
}

if (queue) {
  // Define processor
  queue.process(async (job: Queue.Job) => {
    const data = job.data as DriftJobData;
    logger.info(`Processing drift job for project ${data.projectId} (job ${job.id})`);
    try {
      const result = await driftService.checkForDrift(data.projectId);
      logger.info(`Drift job ${job.id} completed for project ${data.projectId}`);
      return result;
    } catch (err) {
      logger.error(`Drift job ${job.id} failed for project ${data.projectId}:`, err);
      throw err;
    }
  });
}

export const addDriftJob = async (projectId: string) => {
  if (useRedis && queue) {
    // Enqueue into Bull with retries and backoff
    await queue.add({ projectId }, { attempts: 3, backoff: { type: 'exponential', delay: 5000 }, removeOnComplete: true, removeOnFail: false });
    logger.info(`Enqueued drift job for project ${projectId}`);
  } else {
    // Fallback: run immediately in background
    logger.info(`Running drift check immediately for project ${projectId} (in-memory fallback)`);
    // Do not await to avoid blocking
    void driftService.checkForDrift(projectId).catch(err => logger.error('In-memory drift check failed', err));
  }
};

export const closeQueue = async () => {
  if (queue) {
    await queue.close();
  }
};

export const isUsingRedis = () => useRedis;
