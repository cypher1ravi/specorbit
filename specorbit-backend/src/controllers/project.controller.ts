import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { z } from 'zod';
import logger from '../utils/logger';

// 1. Validation Schema
const createProjectSchema = z.object({
  name: z.string().min(1),
  teamId: z.string().uuid(),
  description: z.string().optional(),
  githubRepoUrl: z.string().optional(), 
  language: z.enum(['javascript', 'typescript']).default('javascript'),
});

export class ProjectController {
  
  // GET /api/projects
  static async list(req: Request, res: Response) {
    try {
      const projects = await prisma.project.findMany({
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
      // 1. Validate Input
      const data = createProjectSchema.parse(req.body);
      
      // 2. Generate Slug
      const slug = data.name.toLowerCase().replace(/ /g, '-') + '-' + Date.now();

      // 3. Save to Database
      // MAPPING HAPPENS HERE: githubRepo -> githubRepoUrl
      const project = await prisma.project.create({
        data: {
          name: data.name,
          teamId: data.teamId,
          description: data.description,
          slug,
          githubRepoUrl: data.githubRepoUrl, 
          language: data.language,
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

      if (!project) return res.status(404).json({ error: 'Project not found' });
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }
}