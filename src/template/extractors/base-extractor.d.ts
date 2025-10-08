/**
 * Base extractor class that defines the common interface for all data extractors
 */
import type { ActionInputs } from '../../types/inputs.js';
export declare abstract class BaseExtractor<TOutput> {
    protected readonly extractorName: string;
    constructor(extractorName: string);
    /**
     * Static factory method that each extractor must implement
     * Creates an instance of the extractor configured for the given inputs
     */
    static create(_inputs: ActionInputs): BaseExtractor<any>;
    /**
     * Determines if extraction should be performed based on the action inputs
     */
    abstract shouldExtract(inputs: ActionInputs): boolean;
    /**
     * Performs the actual data extraction
     */
    protected abstract performExtraction(inputs: ActionInputs): Promise<TOutput> | TOutput;
    /**
     * Main extraction method that handles logging and error handling
     */
    extract(inputs: ActionInputs): Promise<TOutput | undefined>;
}
//# sourceMappingURL=base-extractor.d.ts.map