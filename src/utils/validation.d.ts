/**
 * Input validation utilities
 */
import type { ActionInputs, RepoInfo } from '../types/inputs.js';
/**
 * Validation utilities
 */
export declare class ValidationUtils {
    /**
     * Validate action inputs from environment variables
     */
    static validateInputs(): ActionInputs;
    /**
     * Parse repository name into owner and repo
     */
    static parseRepoName(repoName: string): RepoInfo;
}
//# sourceMappingURL=validation.d.ts.map