import axios from 'axios';
import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs';
import logger from '../utils/logger';

export class GitHubService {
  static async downloadRepo(repoUrl: string, branch: string, destination: string): Promise<string> {
    const cleaned = repoUrl.replace(/^(https?:\/\/)?github\.com\//, '');
    const [owner, repo] = cleaned.split('/');
    const archiveUrl = `https://api.github.com/repos/${owner}/${repo}/zipball/${branch}`;

    logger.info(`📦 Downloading repository archive: ${archiveUrl}`);

    try {
      const response = await axios.get(archiveUrl, {
        responseType: 'arraybuffer',
        headers: {
          'Authorization': process.env.GITHUB_TOKEN ? `token ${process.env.GITHUB_TOKEN}` : undefined,
          'User-Agent': 'SpecOrbit-Agent'
        }
      });

      const zip = new AdmZip(Buffer.from(response.data));
      const zipEntries = zip.getEntries();
      const rootFolder = zipEntries[0].entryName;
      
      zip.extractAllTo(destination, true);
      return path.join(destination, rootFolder);
    } catch (error: any) {
      logger.error(`GitHub Download Failed: ${error.message}`);
      throw new Error('Failed to fetch source code from GitHub.');
    }
  }

  static async fetchSourceCode(repoUrl: string, branch: string, filePath: string): Promise<string> {
     // Kept for single-file fallbacks or webhooks
     const cleaned = repoUrl.replace(/^(https?:\/\/)?github\.com\//, '');
     const [owner, repo] = cleaned.split('/');
     const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;
     
     const response = await axios.get(apiUrl, {
       headers: { 
         'Accept': 'application/vnd.github.v3.raw',
         'Authorization': process.env.GITHUB_TOKEN ? `token ${process.env.GITHUB_TOKEN}` : undefined 
       }
     });
     return response.data;
  }
}