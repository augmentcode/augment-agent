/**
 * Template processor - orchestrates the entire template processing pipeline
 */
import { TemplateEngine } from './template-engine.js';
import { ContextBuilder } from './context-builder.js';
import type { ActionInputs } from '../types/inputs.js';
export declare class TemplateProcessor {
    private templateEngine;
    private contextBuilder;
    constructor(templateEngine: TemplateEngine, contextBuilder: ContextBuilder);
    static create(inputs: ActionInputs): TemplateProcessor;
    processTemplate(inputs: ActionInputs): Promise<string>;
    private writeInstructionFile;
}
//# sourceMappingURL=template-processor.d.ts.map