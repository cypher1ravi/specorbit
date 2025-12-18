import logger from '../utils/logger';
import prisma from '../lib/prisma';
import axios from 'axios';
import { SpecService } from './spec.service';
import { OpenAPIV3 } from 'openapi-types';

export class DriftService {
  /**
   * Checks a project's live endpoints against its OpenAPI spec for drift.
   * @param projectId The ID of the project to check.
   */
  async checkForDrift(projectId: string) {
    logger.info(`Starting drift detection for project ${projectId}...`);

    // 1. Fetch project
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      logger.warn(`Project not found: ${projectId}`);
      return { projectId, status: 'failed', message: 'Project not found' };
    }

    if (!project.baseUrl || !/^https?:\/\//i.test(project.baseUrl)) {
      logger.warn(`Project ${projectId} has invalid or missing baseUrl ('${project.baseUrl}'). Skipping drift check.`);
      return { projectId, status: 'skipped', message: 'Project missing or invalid baseUrl' };
    }

    // 2. Get latest spec
    const specRecord = await new SpecService().getLatestSpec(projectId);
    if (!specRecord || !specRecord.specJson) {
      logger.warn(`No spec found for project ${projectId}. Skipping drift check.`);
      return { projectId, status: 'skipped', message: 'No spec available' };
    }

    const spec = specRecord.specJson as OpenAPIV3.Document;
    const paths = spec.paths || {};

    const detectionResults: any[] = [];
    let totalChecks = 0;

    // 3. Iterate through paths and methods
    for (const [path, pathItem] of Object.entries(paths)) {
      const item = pathItem as OpenAPIV3.PathItemObject;
      const methods = ['get','post','put','delete','patch','options'];

      for (const method of methods) {
        const operation = (item as any)[method];
        if (!operation) continue;

        totalChecks++;
        // Replace path params like {id} with a default '1'
        const urlPath = path.replace(/\{[^}]+\}/g, '1');
        const url = `${project.baseUrl.replace(/\/$/, '')}${urlPath.startsWith('/') ? '' : '/'}${urlPath}`;

        try {
          const resp = await axios.request({
            method: method as any,
            url,
            timeout: 5000,
            validateStatus: () => true // Accept any status to inspect it
          });

          const status = resp.status;
          const expectedStatuses = Object.keys(operation.responses || {});
          if (expectedStatuses.length === 0) expectedStatuses.push('200');

          // 4. If returned status not in spec responses -> record drift
          if (!expectedStatuses.includes(String(status))) {
            const discrepancyType = status === 404 ? 'missing_endpoint' : 'changed_response';
            const severity = discrepancyType === 'missing_endpoint' ? 'critical' : 'warning';

            const det = await prisma.driftDetection.create({
              data: {
                projectId,
                endpointPath: path,
                method: method.toUpperCase(),
                discrepancyType,
                specDefinition: operation as any,
                actualResponse: { status: resp.status, body: resp.data },
                severity,
                resolved: false
              }
            });

            detectionResults.push(det);
            logger.warn(`Drift detected: [${discrepancyType}] ${method.toUpperCase()} ${path} -> ${status}`);
          }

        } catch (err: any) {
          // Network or other error -> record as changed_response
          logger.error(`Error checking ${method.toUpperCase()} ${path} (url=${url}): ${err.message}`);
          const det = await prisma.driftDetection.create({
            data: {
              projectId,
              endpointPath: path,
              method: method.toUpperCase(),
              discrepancyType: 'changed_response',
              specDefinition: operation as any,
              actualResponse: { error: err.message, url },
              severity: 'warning',
              resolved: false
            }
          });
          detectionResults.push(det);
        }
      }
    }

    const summary = {
      projectId,
      status: 'completed',
      totalChecks,
      detections: detectionResults.length,
      detectionIds: detectionResults.map(d => d.id)
    };

    logger.info(`Drift detection completed for ${projectId}. Checks: ${totalChecks}, Detections: ${detectionResults.length}`);

    return summary;
  }
}
