/**
 * Base extractor class that defines the common interface for all data extractors
 */

import { logger } from '../../utils/logger.js';
import type { ActionInputs } from '../../types/inputs.js';

export abstract class BaseExtractor<TOutput> {
  protected readonly extractorName: string;

  constructor(extractorName: string) {
    this.extractorName = extractorName;
  }

  /**
   * Static factory method that each extractor must implement
   * Creates an instance of the extractor configured for the given inputs
   */
  static create(_inputs: ActionInputs): BaseExtractor<any> {
    throw new Error('Subclasses must implement the static create method');
  }

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
  async extract(inputs: ActionInputs): Promise<TOutput | undefined> {
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
    } catch (error) {
      logger.error(`${this.extractorName} extraction failed`, error);
      throw error;
    }
  }
}
