import { Request, Response } from 'express';
import { SpecService } from '../services/spec.service';
import prisma from '../lib/prisma';

const specService = new SpecService();

export class SpecController {

  // POST /api/projects/:id/sync
  // Trigger a manual sync (Parses code sent in body)
  static async sync(req: Request, res: Response) {
    try {
      const projectId = req.params.id;
      const { code } = req.body;

      if (!code) {
        return res.status(400).json({ error: 'Source code is required' });
      }

      // Generate and save
      const spec = await specService.generateAndSave(projectId, code, '1.0.1'); // Version bumping is mocked for now

      res.status(201).json({
        message: 'Documentation synced successfully',
        specId: spec.id,
        version: spec.version
      });

    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/projects/:id/specs/latest
  static async getLatest(req: Request, res: Response) {
    try {
      const spec = await specService.getLatestSpec(req.params.id);
      if (!spec) return res.status(404).json({ error: 'No specs found' });
      
      res.json(spec);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}