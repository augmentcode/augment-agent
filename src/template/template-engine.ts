/**
 * Template engine for rendering Nunjucks templates
 */

import * as nunjucks from 'nunjucks';
import { resolve } from 'node:path';
import { FileUtils } from '../utils/file-utils.js';
import { logger } from '../utils/logger.js';
import { ERROR, PATHS } from '../config/constants.js';
import type { TemplateContext } from '../types/context.js';
import { ActionInputs } from '../types/inputs.js';

export class TemplateEngine {
  private env: nunjucks.Environment;
  private templateDirectory: string;

  constructor(templateDirectory: string) {
    this.templateDirectory = resolve(templateDirectory);

    // Configure Nunjucks environment
    this.env = nunjucks.configure(this.templateDirectory, {
      autoescape: false,
      throwOnUndefined: true,
      trimBlocks: true,
      lstripBlocks: true,
      noCache: true, // Ensure fresh reads in CI environment
    });

    this.setupCustomFilters();
    logger.debug(`Template engine initialized with directory: ${this.templateDirectory}`);
  }

  static create(inputs: ActionInputs): TemplateEngine {
    return new TemplateEngine(inputs.templateDirectory!);
  }

  async renderTemplate(templateName: string, context: TemplateContext): Promise<string> {
    try {
      // Validate template file exists and is safe
      await FileUtils.validateTemplateFile(this.templateDirectory, templateName);

      logger.debug(`Rendering template: ${templateName}`, { contextKeys: Object.keys(context) });

      // Render template
      const rendered = this.env.render(templateName, context);

      logger.info(`Template rendered successfully`, {
        templateName,
        contentLength: rendered.length,
      });

      return rendered;
    } catch (error) {
      const message = `${ERROR.TEMPLATE.RENDER_ERROR}: ${error instanceof Error ? error.message : String(error)}`;
      logger.error(message, error);
      throw new Error(message);
    }
  }

  private resolveFilePath(filePath: string): string | undefined {
    const fs = require('fs');
    // Try using the path as absolute if it's within allowed directories
    const absolutePath = resolve(filePath);
    if (
      (absolutePath.startsWith(this.templateDirectory) ||
        absolutePath.startsWith(PATHS.TEMP_DIR)) &&
      fs.existsSync(absolutePath)
    ) {
      return absolutePath;
    }

    // Try resolving relative to template directory
    const templatePath = resolve(this.templateDirectory, filePath);
    if (templatePath.startsWith(this.templateDirectory) && fs.existsSync(templatePath)) {
      return templatePath;
    }
    // Try resolving relative to tmp directory
    const tmpPath = resolve(PATHS.TEMP_DIR, filePath);
    if (tmpPath.startsWith(PATHS.TEMP_DIR) && fs.existsSync(tmpPath)) {
      return tmpPath;
    }
    return undefined;
  }

  maybeReadFile(filePath: string): string {
    try {
      if (!filePath) {
        logger.warning('Empty file path provided to maybe_read_file filter');
        return '';
      }
      const resolvedPath = this.resolveFilePath(filePath);
      if (!resolvedPath) {
        logger.warning(
          `File path ${filePath} not found in allowed directories (template: ${this.templateDirectory}, tmp: ${PATHS.TEMP_DIR})`
        );
        return filePath; // Return original path as fallback
      }
      const fs = require('fs');
      // Synchronous read for template rendering
      const content = fs.readFileSync(resolvedPath, 'utf8');
      logger.debug('File read successfully via filter', {
        originalPath: filePath,
        resolvedPath: resolvedPath,
        contentLength: content.length,
      });
      return content;
    } catch (_error) {
      logger.warning('Failed to read file via filter, returning original path', {
        filePath,
      });
      return filePath; // Return original path as fallback
    }
  }

  formatFiles(files: Array<{ filename: string; status: string }>): string {
    if (!Array.isArray(files) || files.length === 0) {
      return 'No files changed';
    }
    return files.map(file => `${file.status.toUpperCase()}: ${file.filename}`).join('\n');
  }

  private setupCustomFilters(): void {
    this.env.addFilter('maybe_read_file', this.maybeReadFile.bind(this));
    this.env.addFilter('format_files', this.formatFiles.bind(this));
    logger.debug('Custom filters setup complete');
  }
}
