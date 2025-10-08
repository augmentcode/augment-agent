/**
 * Logging utilities for the Augment Agent
 */
import * as core from '@actions/core';
import { ACTION_CONFIG } from '../config/constants.js';
/**
 * Structured logger for GitHub Actions
 */
export class Logger {
    context;
    constructor(context = ACTION_CONFIG.NAME) {
        this.context = context;
    }
    /**
     * Log debug information
     */
    debug(message, data) {
        const logMessage = this.formatMessage(message, data);
        core.debug(logMessage);
    }
    /**
     * Log informational message
     */
    info(message, data) {
        const logMessage = this.formatMessage(message, data);
        core.info(logMessage);
    }
    /**
     * Log warning message
     */
    warning(message, data) {
        const logMessage = this.formatMessage(message, data);
        core.warning(logMessage);
    }
    /**
     * Log error message
     */
    error(message, error, data) {
        const errorData = error instanceof Error
            ? { error: error.message, stack: error.stack, ...data }
            : { error: String(error), ...data };
        const logMessage = this.formatMessage(message, errorData);
        core.error(logMessage);
    }
    /**
     * Set a failed status with error message
     */
    setFailed(message, error) {
        if (error instanceof Error) {
            this.error(message, error);
            core.setFailed(`${message}: ${error.message}`);
        }
        else {
            this.error(message, error);
            core.setFailed(message);
        }
    }
    /**
     * Format log message with context and optional data
     */
    formatMessage(message, data) {
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
//# sourceMappingURL=logger.js.map