/**
 * Template processor - orchestrates the entire template processing pipeline
 */
import { TemplateEngine } from './template-engine.js';
import { ContextBuilder } from './context-builder.js';
import { FileUtils } from '../utils/file-utils.js';
import { logger } from '../utils/logger.js';
import { PATHS } from '../config/constants.js';
export class TemplateProcessor {
    templateEngine;
    contextBuilder;
    constructor(templateEngine, contextBuilder) {
        this.templateEngine = templateEngine;
        this.contextBuilder = contextBuilder;
    }
    static create(inputs) {
        return new TemplateProcessor(TemplateEngine.create(inputs), ContextBuilder.create(inputs));
    }
    async processTemplate(inputs) {
        try {
            logger.info('Starting template processing pipeline', {
                templateDirectory: inputs.templateDirectory,
                templateName: inputs.templateName,
            });
            const context = await this.contextBuilder.buildContext(inputs);
            const content = await this.templateEngine.renderTemplate(inputs.templateName, context);
            const instructionFilePath = await this.writeInstructionFile(content);
            logger.info('Template processing pipeline completed', {
                instructionFile: instructionFilePath,
                contentLength: content.length,
            });
            return instructionFilePath;
        }
        catch (error) {
            logger.error('Template processing pipeline failed', error);
            throw error;
        }
    }
    async writeInstructionFile(content) {
        try {
            await FileUtils.ensureDirectoryExists(PATHS.TEMP_DIR);
            await FileUtils.writeFile(PATHS.INSTRUCTION_FILE, content);
            logger.info('Instruction file written', {
                filePath: PATHS.INSTRUCTION_FILE,
                contentLength: content.length,
            });
            return PATHS.INSTRUCTION_FILE;
        }
        catch (error) {
            logger.error('Failed to write instruction file', error);
            throw error;
        }
    }
}
//# sourceMappingURL=template-processor.js.map