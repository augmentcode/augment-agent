/**
 * GitHub API service for PR information extraction
 */
import { PullRequestInfo, PullRequestFile, PullRequestDiff } from '../types/github.js';
export declare class GitHubService {
    private octokit;
    private owner;
    private repo;
    constructor(config: {
        token: string;
        owner: string;
        repo: string;
    });
    getPullRequest(pullNumber: number): Promise<PullRequestInfo>;
    getPullRequestFiles(pullNumber: number): Promise<PullRequestFile[]>;
    getPullRequestDiff(pullNumber: number): Promise<PullRequestDiff>;
}
//# sourceMappingURL=github-service.d.ts.map