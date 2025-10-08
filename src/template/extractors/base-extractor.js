/**
 * Base extractor class that defines the common interface for all data extractors
 */
import { logger } from '../../utils/logger.js';
export class BaseExtractor {
    extractorName;
    constructor(extractorName) {
        this.extractorName = extractorName;
    }
    /**
     * Static factory method that each extractor must implement
     * Creates an instance of the extractor configured for the given inputs
     */
    static create(_inputs) {
        throw new Error('Subclasses must implement the static create method');
    }
    /**
     * Main extraction method that handles logging and error handling
     */
    async extract(inputs) {
        try {
            if (!this.shouldExtract(inputs)) {
                logger.debug(`${this.extractorName} extraction skipped`, {
                    reason: 'shouldExtract returned false',
                });
                return undefined;
            }
            logger.debug(`Starting ${this.extractorName} extraction`);
            const result = await this.performExtraction(inputs);
            logger.debug(`${this.extractorName} extraction completed successfully`);
            return result;
        }
        catch (error) {
            logger.error(`${this.extractorName} extraction failed`, error);
            throw error;
        }
    }
}
//# sourceMappingURL=base-extractor.js.map