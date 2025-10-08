/**
 * Custom context extractor - handles parsing JSON strings into context objects
 */
import { BaseExtractor } from './base-extractor.js';
import { logger } from '../../utils/logger.js';
import { ERROR } from '../../config/constants.js';
export class CustomContextExtractor extends BaseExtractor {
    constructor() {
        super('Custom Context');
    }
    /**
     * Creates a CustomContextExtractor instance
     */
    static create(_inputs) {
        return new CustomContextExtractor();
    }
    /**
     * Determines if custom context extraction should be performed
     */
    shouldExtract(inputs) {
        return !!(inputs.customContext && inputs.customContext.trim().length > 0);
    }
    /**
     * Performs custom context extraction by parsing JSON string
     */
    performExtraction(inputs) {
        const jsonString = inputs.customContext;
        try {
            const parsed = JSON.parse(jsonString);
            if (typeof parsed !== 'object' || parsed === null) {
                throw new Error('Parsed JSON must be an object');
            }
            logger.debug('Custom context parsed successfully', {
                keys: Object.keys(parsed),
                keyCount: Object.keys(parsed).length,
            });
            return parsed;
        }
        catch (error) {
            const message = `${ERROR.INPUT.INVALID_CONTEXT_JSON}: ${error instanceof Error ? error.message : String(error)}`;
            logger.error('Failed to parse custom context JSON', error);
            throw new Error(message);
        }
    }
}
//# sourceMappingURL=custom-context-extractor.js.map