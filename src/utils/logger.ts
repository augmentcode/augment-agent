/**
 * Logging utilities for the Augment Agent
 */

import * as core from '@actions/core';
import { ACTION_CONFIG } from '../config/constants.js';

/**
 * Structured logger for GitHub Actions
 */
export class Logger {
  private context: string;

  constructor(context: string = ACTION_CONFIG.NAME) {
    this.context = context;
  }

  /**
   * Log debug information
   */
  debug(message: string, data?: Record<string, unknown>): void {
    const logMessage = this.formatMessage(message, data);
    core.debug(logMessage);
  }

  /**
   * Log informational message
   */
  info(message: string, data?: Record<string, unknown>): void {
    const logMessage = this.formatMessage(message, data);
    core.info(logMessage);
  }

  /**
   * Log warning message
   */
  warning(message: string, data?: Record<string, unknown>): void {
    const logMessage = this.formatMessage(message, data);
    core.warning(logMessage);
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error | unknown, data?: Record<string, unknown>): void {
    const errorData =
      error instanceof Error
        ? { error: error.message, stack: error.stack, ...data }
        : { error: String(error), ...data };

    const logMessage = this.formatMessage(message, errorData);
    core.error(logMessage);
  }

  /**
   * Set a failed status with error message
   */
  setFailed(message: string, error?: Error | unknown): void {
    if (error instanceof Error) {
      this.error(message, error);
      core.setFailed(`${message}: ${error.message}`);
    } else {
      this.error(message, error);
      core.setFailed(message);
    }
  }

  /**
   * Format log message with context and optional data
   */
  private formatMessage(message: string, data?: Record<string, unknown>): string {
    const timestamp = new Date().toISOString();
    let formattedMessage = `[${timestamp}] [${this.context}] ${message}`;

    if (data && Object.keys(data).length > 0) {
      formattedMessage += ` | Data: ${JSON.stringify(data, null, 2)}`;
    }

    return formattedMessage;
  }
}

/**
 * Default logger instance
 */
export const logger = new Logger();
