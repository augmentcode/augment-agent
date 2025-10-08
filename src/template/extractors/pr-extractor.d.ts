/**
 * PR data extractor - responsible for extracting and formatting PR data from GitHub API
 */
import { BaseExtractor } from './base-extractor.js';
import { GitHubService } from '../../services/github-service.js';
import type { PRData } from '../../types/context.js';
import type { ActionInputs } from '../../types/inputs.js';
export declare class PRExtractor extends BaseExtractor<PRData> {
    private githubService?;
    constructor(githubService?: GitHubService | undefined);
    /**
     * Creates a PRExtractor instance configured for the given inputs
     */
    static create(inputs: ActionInputs): PRExtractor;
    /**
     * Determines if PR extraction should be performed
     */
    shouldExtract(inputs: ActionInputs): boolean;
    /**
     * Performs the actual PR data extraction
     */
    protected performExtraction(inputs: ActionInputs): Promise<PRData>;
    private writeDiffFile;
}
//# sourceMappingURL=pr-extractor.d.ts.map