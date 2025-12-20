import prisma from '../lib/prisma';
import { ExpressParser } from './parser/express.parser';
import { GitHubService } from './github.service';
import logger from '../utils/logger';
import path from 'path';
import fs from 'fs';

export class SpecService {
  async generateAndSave(projectId: string, entryCode: string, version: string, repoContext?: { repo: string, branch: string, entryPath: string }) {
    let allRoutes: any[] = [];
    const parser = new ExpressParser();

    if (repoContext) {
      const tempRoot = path.join(process.cwd(), '.temp', `sync-${Date.now()}`);
      fs.mkdirSync(tempRoot, { recursive: true });

      try {
        const sourcePath = await GitHubService.downloadRepo(repoContext.repo, repoContext.branch, tempRoot);
        const fullEntryPath = path.join(sourcePath, repoContext.entryPath);
        
        // ⚡ Parse locally from disk
        allRoutes = parser.parseFile(fullEntryPath, sourcePath);
      } finally {
        fs.rmSync(tempRoot, { recursive: true, force: true });
      }
    } else {
      allRoutes = parser.parseCode(entryCode, 'app.ts').routes;
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    const specJson = this.generateOpenAPIJson(allRoutes, project?.name || 'API Docs');

    return await prisma.openAPISpec.create({
      data: { projectId, version, specJson: specJson as any, isPublished: true }
    });
  }

  private generateOpenAPIJson(routes: any[], title: string) {
    const paths: any = {};
    routes.forEach(r => {
      const openPath = r.path.replace(/:(\w+)/g, '{$1}');
      if (!paths[openPath]) paths[openPath] = {};
      paths[openPath][r.method.toLowerCase()] = {
        summary: `Handler for ${r.path}`,
        responses: { '200': { description: 'Success' } }
      };
    });
    return { openapi: '3.0.0', info: { title, version: '1.0.0' }, paths };
  }
}