/**
 * Context builder - responsible for aggregating context from multiple sources
 */
import { PRExtractor } from './extractors/pr-extractor.js';
import { CustomContextExtractor } from './extractors/custom-context-extractor.js';
import type { TemplateContext } from '../types/context.js';
import type { ActionInputs } from '../types/inputs.js';
export declare class ContextBuilder {
    private prExtractor;
    private customContextExtractor;
    constructor(prExtractor: PRExtractor, customContextExtractor: CustomContextExtractor);
    static create(inputs: ActionInputs): ContextBuilder;
    buildContext(inputs: ActionInputs): Promise<TemplateContext>;
}
//# sourceMappingURL=context-builder.d.ts.map