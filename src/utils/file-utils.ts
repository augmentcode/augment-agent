/**
 * File system utilities
 */

import { promises as fs } from 'node:fs';
import { resolve } from 'node:path';
import { TEMPLATE_CONFIG, ERROR } from '../config/constants.js';
import { logger } from './logger.js';

export class FileUtils {
  static async writeFile(filePath: string, content: string): Promise<void> {
    try {
      logger.debug('Writing file', { filePath, contentLength: content.length });
      await fs.writeFile(filePath, content, 'utf8');
      logger.debug('File written successfully', { filePath });
    } catch (error) {
      logger.error('Failed to write file', error, { filePath });
      throw error;
    }
  }

  static async readFile(filePath: string): Promise<string> {
    try {
      logger.debug('Reading file', { filePath });
      const content = await fs.readFile(filePath, 'utf8');
      logger.debug('File read successfully', { filePath, contentLength: content.length });
      return content;
    } catch (error) {
      logger.error('Failed to read file', error, { filePath });
      throw error;
    }
  }

  static async validateTemplateFile(templateDir: string, templateName: string): Promise<string> {
    logger.debug('Validating template file', { templateDir, templateName });

    const templatePath = resolve(templateDir, templateName);

    // Security check - ensure template is within template directory
    if (!templatePath.startsWith(resolve(templateDir))) {
      const message = `${ERROR.TEMPLATE.PATH_OUTSIDE_DIRECTORY}: ${templateName}`;
      logger.error(message, undefined, { templateDir, templateName, templatePath });
      throw new Error(message);
    }

    try {
      await fs.access(templatePath);
      logger.debug('Template file exists', { templatePath });
    } catch (error) {
      const message = `${ERROR.TEMPLATE.NOT_FOUND}: ${templatePath}`;
      logger.error(message, error, { templateDir, templateName, templatePath });
      throw new Error(message);
    }

    // Check file size
    const stats = await fs.stat(templatePath);
    if (stats.size > TEMPLATE_CONFIG.MAX_TEMPLATE_SIZE) {
      const message = `${ERROR.TEMPLATE.TOO_LARGE}: ${stats.size} bytes`;
      logger.error(message, undefined, {
        templatePath,
        fileSize: stats.size,
        maxSize: TEMPLATE_CONFIG.MAX_TEMPLATE_SIZE,
      });
      throw new Error(message);
    }

    logger.debug('Template file validation successful', {
      templatePath,
      fileSize: stats.size,
    });
    return templatePath;
  }

  static async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      logger.debug('Ensuring directory exists', { dirPath });
      await fs.mkdir(dirPath, { recursive: true });
      logger.debug('Directory ensured', { dirPath });
    } catch (error) {
      // Ignore error if directory already exists
      if ((error as any).code !== 'EEXIST') {
        logger.error('Failed to create directory', error, { dirPath });
        throw error;
      }
      logger.debug('Directory already exists', { dirPath });
    }
  }
}
