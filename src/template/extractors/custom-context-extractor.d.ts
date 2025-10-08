/**
 * Custom context extractor - handles parsing JSON strings into context objects
 */
import { BaseExtractor } from './base-extractor.js';
import type { ActionInputs } from '../../types/inputs.js';
export declare class CustomContextExtractor extends BaseExtractor<Record<string, any>> {
    constructor();
    /**
     * Creates a CustomContextExtractor instance
     */
    static create(_inputs: ActionInputs): CustomContextExtractor;
    /**
     * Determines if custom context extraction should be performed
     */
    shouldExtract(inputs: ActionInputs): boolean;
    /**
     * Performs custom context extraction by parsing JSON string
     */
    protected performExtraction(inputs: ActionInputs): Record<string, any>;
}
//# sourceMappingURL=custom-context-extractor.d.ts.map