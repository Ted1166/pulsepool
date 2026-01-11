// actions/github.ts

import type { Action, ActionResult } from "../types/actions";



export interface GitHubProjectInfo {
  name: string;
  description: string | null;
  stars: number;
  forks: number;
  openIssues: number;
  watchers: number;
  language: string | null;
  lastUpdated: string;
  createdAt: string;
  recentCommits: Array<{
    sha: string;
    message: string;
    author: string;
    date: string;
  }>;
  recentIssues: Array<{
    number: number;
    title: string;
    state: string;
    user: string;
    date: string;
  }>;
  rateLimitRemaining: number;
}

export class GitHubAction implements Action {
  name = 'github_get_project_info';
  description = 'Fetches public project information from GitHub including metrics, recent commits, and issues. Use this when users ask about a GitHub project, repository activity, or development progress.';
  parameters = [
    {
      name: 'owner',
      type: 'string' as const,
      description: 'GitHub repository owner or organization (e.g., "uniswap")',
      required: true
    },
    {
      name: 'repo',
      type: 'string' as const,
      description: 'GitHub repository name (e.g., "v3-core")',
      required: true
    }
  ];

  private rateLimitRemaining: number = 60;

  private async fetchGitHub(endpoint: string): Promise<any> {
    const response = await fetch(`https://api.github.com${endpoint}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'PulsePool-Agent'
      }
    });

    // Track rate limit
    const remaining = response.headers.get('X-RateLimit-Remaining');
    if (remaining) {
      this.rateLimitRemaining = parseInt(remaining, 10);
    }

    if (response.status === 404) {
      throw new Error('Repository not found. Check the owner and repo name.');
    }

    if (response.status === 403 && this.rateLimitRemaining === 0) {
      const resetTime = response.headers.get('X-RateLimit-Reset');
      const resetDate = resetTime ? new Date(parseInt(resetTime, 10) * 1000) : null;
      throw new Error(
        `GitHub rate limit exceeded. Resets at ${resetDate?.toLocaleTimeString() || 'unknown'}.`
      );
    }

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    return response.json();
  }

  async execute(params: Record<string, unknown>): Promise<ActionResult> {
    const { owner, repo } = params;

    if (!owner || !repo) {
      return { success: false, error: 'Both owner and repo are required' };
    }

    // Warn if rate limit is low
    if (this.rateLimitRemaining < 5) {
      return {
        success: false,
        error: `Rate limit low (${this.rateLimitRemaining} remaining). Try again later.`
      };
    }

    try {
      // Fetch all data in parallel
      const [repoData, commits, issues] = await Promise.all([
        this.fetchGitHub(`/repos/${owner}/${repo}`),
        this.fetchGitHub(`/repos/${owner}/${repo}/commits?per_page=5`).catch(() => []),
        this.fetchGitHub(`/repos/${owner}/${repo}/issues?state=all&per_page=5&sort=updated`).catch(() => [])
      ]);

      const data: GitHubProjectInfo = {
        name: repoData.full_name,
        description: repoData.description,
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        openIssues: repoData.open_issues_count,
        watchers: repoData.subscribers_count,
        language: repoData.language,
        lastUpdated: repoData.updated_at,
        createdAt: repoData.created_at,
        recentCommits: commits.map((c: any) => ({
          sha: c.sha.substring(0, 7),
          message: c.commit.message.split('\n')[0].substring(0, 100),
          author: c.commit.author?.name || c.author?.login || 'Unknown',
          date: c.commit.author?.date || ''
        })),
        recentIssues: issues.map((i: any) => ({
          number: i.number,
          title: i.title.substring(0, 100),
          state: i.state,
          user: i.user?.login || 'Unknown',
          date: i.created_at
        })),
        rateLimitRemaining: this.rateLimitRemaining
      };

      return { success: true, data };

    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
}

