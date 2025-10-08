/**
 * GitHub API service for PR information extraction
 */
import { Octokit } from '@octokit/rest';
import { TEMPLATE_CONFIG, ERROR } from '../config/constants.js';
import { logger } from '../utils/logger.js';
export class GitHubService {
    octokit;
    owner;
    repo;
    constructor(config) {
        this.octokit = new Octokit({ auth: config.token });
        this.owner = config.owner;
        this.repo = config.repo;
    }
    async getPullRequest(pullNumber) {
        try {
            logger.debug(`Fetching PR ${pullNumber} from ${this.owner}/${this.repo}`);
            const { data } = await this.octokit.rest.pulls.get({
                owner: this.owner,
                repo: this.repo,
                pull_number: pullNumber,
            });
            return {
                number: data.number,
                title: data.title,
                body: data.body,
                state: data.state,
                user: { login: data.user?.login || 'unknown' },
                head: {
                    ref: data.head.ref,
                    sha: data.head.sha,
                    repo: {
                        full_name: data.head.repo.full_name,
                        name: data.head.repo.name,
                        owner: {
                            login: data.head.repo.owner.login,
                        },
                    },
                },
                base: {
                    ref: data.base.ref,
                    sha: data.base.sha,
                    repo: {
                        full_name: data.base.repo.full_name,
                        name: data.base.repo.name,
                        owner: {
                            login: data.base.repo.owner.login,
                        },
                    },
                },
            };
        }
        catch (error) {
            logger.error(`${ERROR.GITHUB.API_ERROR}: Failed to fetch PR ${pullNumber}`, error);
            throw error;
        }
    }
    async getPullRequestFiles(pullNumber) {
        try {
            logger.debug(`Fetching files for PR ${pullNumber}`);
            const allFiles = [];
            let page = 1;
            const perPage = 100; // GitHub's maximum per page
            while (true) {
                logger.debug(`Fetching PR files page ${page}`, {
                    pullNumber,
                    page,
                    perPage,
                });
                const { data } = await this.octokit.rest.pulls.listFiles({
                    owner: this.owner,
                    repo: this.repo,
                    pull_number: pullNumber,
                    per_page: perPage,
                    page,
                });
                // Map and add files from this page
                const pageFiles = data.map(file => ({
                    filename: file.filename,
                    status: file.status,
                    additions: file.additions,
                    deletions: file.deletions,
                    changes: file.changes,
                }));
                allFiles.push(...pageFiles);
                logger.debug(`Fetched ${pageFiles.length} files from page ${page}`, {
                    pullNumber,
                    page,
                    filesOnPage: pageFiles.length,
                    totalFilesSoFar: allFiles.length,
                });
                // If we got fewer files than the page size, we've reached the end
                if (data.length < perPage) {
                    break;
                }
                page++;
            }
            logger.info(`Successfully fetched all PR files`, {
                pullNumber,
                totalFiles: allFiles.length,
                totalPages: page,
            });
            return allFiles;
        }
        catch (error) {
            logger.error(`${ERROR.GITHUB.API_ERROR}: Failed to fetch PR files`, error);
            throw error;
        }
    }
    async getPullRequestDiff(pullNumber) {
        try {
            logger.debug(`Fetching diff for PR ${pullNumber}`);
            const { data } = await this.octokit.rest.pulls.get({
                owner: this.owner,
                repo: this.repo,
                pull_number: pullNumber,
                mediaType: { format: 'diff' },
            });
            const content = data;
            const size = Buffer.byteLength(content, 'utf8');
            const truncated = size > TEMPLATE_CONFIG.MAX_DIFF_SIZE;
            return {
                content: truncated ? content.substring(0, TEMPLATE_CONFIG.MAX_DIFF_SIZE) : content,
                size,
                truncated,
            };
        }
        catch (error) {
            logger.error(`${ERROR.GITHUB.API_ERROR}: Failed to fetch PR diff`, error);
            throw error;
        }
    }
}
//# sourceMappingURL=github-service.js.map