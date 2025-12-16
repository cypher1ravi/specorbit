import prisma from '../lib/prisma';
import { ExpressParser } from './parser/express.parser';
import logger from '../utils/logger';
import path from 'path';
import fs from 'fs';
import { OpenAPIV3 } from 'openapi-types';
import { GitHubService } from './github.service';

export class SpecService {
  static generateAndSave(id: string, entryCode: string, newVersion: string, arg3: { repo: string; branch: any; entryPath: string; }) {
    throw new Error('Method not implemented.');
  }

  async generateAndSave(
    projectId: string, 
    entryCode: string, 
    version: string, 
    repoContext?: { repo: string, branch: string, entryPath: string }
  ) {
    
    let allRoutes: any[] = [];
    const parser = new ExpressParser();

    // If we have GitHub context, use file-based recursive parsing
    if (repoContext) {
      logger.info('🚀 Using recursive file-based parsing from GitHub...');
      
      let tempDir: string | null = null;
      try {
        // Create a temporary directory structure and fetch all dependencies
        tempDir = await this.setupTempDirectoryWithDependencies(repoContext, entryCode);
        
        // Use the new parseFile method for recursive parsing from the entry point
        const entryFilePath = path.join(tempDir, repoContext.entryPath);
        allRoutes = parser.parseFile(entryFilePath, tempDir);
        
      } catch (error) {
        logger.error('Failed to parse with file system:', error);
        // Fallback to old method
        allRoutes = this.fallbackParsing(parser, entryCode);
      } finally {
        // Cleanup temp directory
        if (tempDir) {
          this.cleanupTempDirectory(tempDir);
        }
      }
      
    } else {
      // No repo context - parse only the entry code
      logger.info('⚠️  No repo context, parsing entry file only...');
      const mainParse = parser.parseCode(entryCode, 'app.ts');
      allRoutes = mainParse.routes;
    }

    // Generate OpenAPI JSON
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    const specJson = this.generateOpenAPIJson(allRoutes, project?.name || 'API Docs');
    
    logger.info(`✅ Found ${allRoutes.length} total routes`);

    // Save to Database
    const spec = await prisma.openAPISpec.create({
      data: {
        projectId,
        version,
        specJson: specJson as any,
        isPublished: true
      }
    });

    return spec;
  }

  /**
   * Creates a temporary file structure and fetches all dependencies recursively.
   */
  private async setupTempDirectoryWithDependencies(
    repoContext: { repo: string, branch: string, entryPath: string },
    entryCode: string
  ): Promise<string> {
      const tempDir = path.join(process.cwd(), '.temp', `parse-${Date.now()}`);
      fs.mkdirSync(tempDir, { recursive: true });

      const filesToFetch = new Set<string>([repoContext.entryPath]);
      const fetchedFiles = new Set<string>();

      const parser = new ExpressParser();

      while (filesToFetch.size > 0) {
          const currentFilePath = filesToFetch.values().next().value;
          filesToFetch.delete(currentFilePath);

          if (fetchedFiles.has(currentFilePath)) {
              continue;
          }

          try {
              logger.info(`📥 Fetching: ${currentFilePath}`);
              const code = await GitHubService.fetchSourceCode(
                  repoContext.repo,
                  repoContext.branch,
                  currentFilePath
              );

              const localPath = path.join(tempDir, currentFilePath);
              fs.mkdirSync(path.dirname(localPath), { recursive: true });
              fs.writeFileSync(localPath, code);

              fetchedFiles.add(currentFilePath);

              // Parse for new imports
              const { imports } = parser.parseCode(code, currentFilePath, { silent: true });
              const entryDir = path.dirname(repoContext.entryPath);

              for (const importInfo of imports) {
                  if (!importInfo.filePath.startsWith('.')) continue;

                  let targetPath = path.join(path.dirname(currentFilePath), importInfo.filePath).replace(/\\/g, '/');
                  if (!targetPath.endsWith('.ts') && !targetPath.endsWith('.js')) {
                      targetPath += '.ts';
                  }
                  
                  if (!fetchedFiles.has(targetPath)) {
                      filesToFetch.add(targetPath);
                  }
              }
          } catch (error) {
              logger.warn(`⚠️ Failed to fetch or process ${currentFilePath}:`, error);
          }
      }

      return tempDir;
  }

  /**
   * Cleanup temporary directory
   */
  private cleanupTempDirectory(tempDir: string): void {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
      logger.info('🧹 Cleaned up temp directory');
    } catch (error) {
      logger.warn('Failed to cleanup temp directory:', error);
    }
  }

  /**
   * Fallback to old parsing method if file-based fails
   */
  private fallbackParsing(
    parser: ExpressParser,
    entryCode: string
  ): any[] {
    logger.info('⚠️  Using fallback parsing method...');
    
    const allRoutes: any[] = [];
    const mainParse = parser.parseCode(entryCode, 'app.ts');
    allRoutes.push(...mainParse.routes);

    // Handle mounts manually (old way)
    if (mainParse.mounts.length > 0) {
      logger.info(`Found ${mainParse.mounts.length} router mounts`);
      
      // This won't work as well, but provides some fallback
      mainParse.mounts.forEach(mount => {
        logger.warn(`Mount detected but not resolved: ${mount.path} -> ${mount.variableName}`);
      });
    }

    return allRoutes;
  }

  /**
   * Generate OpenAPI JSON from parsed routes
   */
  private generateOpenAPIJson(routes: any[], title: string): OpenAPIV3.Document {
    const paths: OpenAPIV3.PathsObject = {};

    routes.forEach(route => {
      if (!paths[route.path]) paths[route.path] = {};

      const parameters = (route.parameters || []).map((p: any) => ({
        name: p.name,
        in: p.in,
        required: p.required,
        schema: { type: 'string' }
      }));

      (paths[route.path] as any)[route.method.toLowerCase()] = {
        summary: route.description || `${route.method} ${route.path}`,
        parameters,
        responses: {
          '200': { description: 'Success' }
        }
      };
    });

    return {
      openapi: '3.0.0',
      info: { 
        title, 
        version: '1.0.0', 
        description: 'Generated by SpecOrbit with ts-morph parser' 
      },
      paths
    };
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