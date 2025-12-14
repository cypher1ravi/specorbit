import axios from 'axios';
import logger from '../utils/logger';

export class GitHubService {
  
  /**
   * Fetches the raw content of a file from GitHub
   * For MVP, we default to looking for 'src/app.ts' or 'index.ts'
   */
  static async fetchSourceCode(repoName: string, branch: string = 'main'): Promise<string> {
    try {
      // Try fetching app.ts first
      const possiblePaths = ['src/app.ts', 'src/index.ts', 'app.ts', 'index.ts'];
      
      for (const path of possiblePaths) {
        try {
          // Construct Raw URL: https://raw.githubusercontent.com/USER/REPO/BRANCH/PATH
          const url = `https://raw.githubusercontent.com/${repoName}/${branch}/${path}`;
          logger.info(`Fetching code from: ${url}`);
          
          const response = await axios.get(url);
          if (response.status === 200) {
            return response.data; // Return the code string
          }
        } catch (e) {
          // Continue to next path if file not found
          continue;
        }
      }

      throw new Error('No supported entry file (app.ts/index.ts) found in repository.');

    } catch (error: any) {
      logger.error(`GitHub Fetch Error: ${error.message}`);
      throw error;
    }
  }
}