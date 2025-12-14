import prisma from '../lib/prisma';
import { ExpressParser } from './parser/express.parser';
import { OpenApiGenerator } from './parser/openapi.generator';
import logger from '../utils/logger';

export class SpecService {
  private parser: ExpressParser;
  private generator: OpenApiGenerator;

  constructor() {
    this.parser = new ExpressParser();
    this.generator = new OpenApiGenerator();
  }

  /**
   * Generates a spec from code and saves it to the DB
   */
  async generateAndSave(projectId: string, code: string, version: string = '1.0.0') {
    try {
      // 1. Fetch Project to get metadata
      const project = await prisma.project.findUnique({
        where: { id: projectId }
      });

      if (!project) {
        throw new Error('Project not found');
      }

      // 2. Parse the Code
      const routes = this.parser.parseCode(code, 'app.ts'); // hardcoded filename for MVP
      logger.info(`Parsed ${routes.length} routes for project ${project.name}`);

      // 3. Generate OpenAPI JSON
      const specJson = this.generator.generateSpec(routes, project.name, version);

      // 4. Save to Database
      const savedSpec = await prisma.openAPISpec.create({
        data: {
          projectId,
          version,
          specJson: specJson as any, // Cast to any because Prisma expects Json type
          isPublished: true // Auto-publish for MVP
        }
      });

      return savedSpec;

    } catch (error: any) {
      logger.error(`Spec Generation Failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get latest spec for a project
   */
  async getLatestSpec(projectId: string) {
    return await prisma.openAPISpec.findFirst({
      where: { projectId },
      orderBy: { createdAt: 'desc' }
    });
  }
}