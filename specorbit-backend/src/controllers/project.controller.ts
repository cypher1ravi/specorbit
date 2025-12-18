import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { z } from 'zod';
import logger from '../utils/logger';

// 1. Validation Schema
const createProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  baseUrl: z.string().url().optional(),
  githubRepoUrl: z.string().optional(),
  githubBranch: z.string().optional(),
  entryPath: z.string().optional(), 
  language: z.enum(['javascript', 'typescript']).default('javascript'),
});

const updateProjectSchema = createProjectSchema.partial();

export class ProjectController {
  
  // GET /api/projects
  static async list(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const projects = await prisma.project.findMany({
        where: { teamId: req.user.teamId },
        orderBy: { updatedAt: 'desc' },
        include: { 
          _count: { select: { specs: true } } 
        }
      });
      res.json(projects);
    } catch (error: any) {
      logger.error('List Projects Error:', error);
      res.status(500).json({ error: 'Failed to list projects' });
    }
  }

  // POST /api/projects
  static async create(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      // 1. Validate Input
      const data = createProjectSchema.parse(req.body);
      
      // 2. Generate Slug
      const slug = data.name.toLowerCase().replace(/ /g, '-') + '-' + Date.now();

      // 3. Save to Database
      const project = await prisma.project.create({
        data: {
          ...data,
          teamId: req.user.teamId,
          slug,
          githubBranch: data.githubBranch || 'main',
          entryPath: data.entryPath || 'src/app.ts',
        }
      });

      logger.info(`Project created: ${project.id} (Repo: ${data.githubRepoUrl || 'None'})`);
      res.status(201).json(project);

    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.message });
      }
      logger.error('Create Project Error:', error);
      res.status(500).json({ error: 'Failed to create project' });
    }
  }

// GET /api/projects/:id
  static async getOne(req: Request, res: Response) {
    try {
      const project = await prisma.project.findUnique({
        where: { id: req.params.id },
        include: {
          specs: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      });

      if (!project || !req.user || project.teamId !== req.user.teamId) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }

  // PUT /api/projects/:id
  static async update(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const data = updateProjectSchema.parse(req.body);
      const { id } = req.params;

      const project = await prisma.project.findUnique({
        where: { id },
      });

      if (!project || project.teamId !== req.user.teamId) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const updatedProject = await prisma.project.update({
        where: { id },
        data,
      });

      res.json(updatedProject);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      logger.error('Update Project Error:', error);
      res.status(500).json({ error: 'Failed to update project' });
    }
  }
}