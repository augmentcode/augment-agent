/**
 * Context builder - responsible for aggregating context from multiple sources
 */
import { logger } from '../utils/logger.js';
import { PRExtractor } from './extractors/pr-extractor.js';
import { CustomContextExtractor } from './extractors/custom-context-extractor.js';
export class ContextBuilder {
    prExtractor;
    customContextExtractor;
    constructor(prExtractor, customContextExtractor) {
        this.prExtractor = prExtractor;
        this.customContextExtractor = customContextExtractor;
    }
    static create(inputs) {
        return new ContextBuilder(PRExtractor.create(inputs), CustomContextExtractor.create(inputs));
    }
    async buildContext(inputs) {
        try {
            logger.debug('Building template context from inputs');
            const context = {};
            // Extract PR data (extractor decides if it should run)
            const prData = await this.prExtractor.extract(inputs);
            if (prData) {
                context.pr = prData;
                logger.debug('PR data extracted and added to context', {
                    prNumber: prData.number,
                    title: prData.title,
                });
            }
            // Extract custom context if available
            const customContext = await this.customContextExtractor.extract(inputs);
            if (customContext) {
                context.custom = customContext;
                logger.debug('Custom context extracted and added', {
                    customContextKeys: Object.keys(customContext),
                });
            }
            logger.info('Template context built successfully', {
                hasPR: !!context.pr,
                hasCustom: !!context.custom,
                customKeys: context.custom ? Object.keys(context.custom) : [],
            });
            return context;
        }
        catch (error) {
            logger.error('Failed to build template context', error);
            throw error;
        }
    }
}
//# sourceMappingURL=context-builder.js.map