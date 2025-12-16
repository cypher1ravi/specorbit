import axios from 'axios';
import logger from '../utils/logger';

// Utility to parse owner and repo from a GitHub URL
const parseRepoUrl = (url: string) => {
  try {
    // Handles formats like:
    // https://github.com/user/repo
    // github.com/user/repo
    // user/repo
    const cleanedUrl = url.replace(/^(https?:\/\/)?github\.com\//, '');
    const [owner, repo] = cleanedUrl.split('/');
    if (!owner || !repo) {
      throw new Error('Invalid GitHub repository URL format. Expected "owner/repo".');
    }
    return { owner, repo };
  } catch (error) {
    logger.error(`Failed to parse GitHub URL: ${url}`, error);
    throw error;
  }
};

export class GitHubService {

  /**
   * Fetches the raw content of a specific file from a GitHub repository.
   * @param repoUrl The URL of the repository (e.g., "user/repo").
   * @param branch The branch to fetch from.
   * @param filePath The path to the file within the repository.
   * @returns The UTF-8 content of the file.
   */
  static async fetchSourceCode(repoUrl: string, branch: string, filePath: string): Promise<string> {
    const { owner, repo } = parseRepoUrl(repoUrl);
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;

    logger.info(`Fetching from GitHub API: ${apiUrl}`);

    try {
      const response = await axios.get(apiUrl, {
        headers: {
          'Accept': 'application/vnd.github.v3.raw', // Request raw content
          'User-Agent': 'SpecOrbit-Agent', // GitHub requires a User-Agent
          // Note: No authorization token for public repos.
          // For private repos, we would need to add 'Authorization': `token ${accessToken}`
        }
      });

      if (typeof response.data !== 'string') {
        // This can happen if the path is a directory or if the raw content wasn't returned
        throw new Error('Content received was not a string. The path may be a directory or the file is empty.');
      }

      return response.data;
    } catch (error: any) {
      logger.error(`GitHub API request failed for ${apiUrl}. Status: ${error.response?.status}`, error.message);
      
      if (error.response?.status === 404) {
        throw new Error('File not found in repository. Check the repository URL, branch, and file path.');
      }
      throw new Error('Failed to fetch source code from GitHub.');
    }
  }
}
