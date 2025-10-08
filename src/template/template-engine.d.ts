/**
 * Template engine for rendering Nunjucks templates
 */
import type { TemplateContext } from '../types/context.js';
import { ActionInputs } from '../types/inputs.js';
export declare class TemplateEngine {
    private env;
    private templateDirectory;
    constructor(templateDirectory: string);
    static create(inputs: ActionInputs): TemplateEngine;
    renderTemplate(templateName: string, context: TemplateContext): Promise<string>;
    private resolveFilePath;
    maybeReadFile(filePath: string): string;
    formatFiles(files: Array<{
        filename: string;
        status: string;
    }>): string;
    private setupCustomFilters;
}
//# sourceMappingURL=template-engine.d.ts.map