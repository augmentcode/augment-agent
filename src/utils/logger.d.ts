/**
 * Logging utilities for the Augment Agent
 */
/**
 * Structured logger for GitHub Actions
 */
export declare class Logger {
    private context;
    constructor(context?: string);
    /**
     * Log debug information
     */
    debug(message: string, data?: Record<string, unknown>): void;
    /**
     * Log informational message
     */
    info(message: string, data?: Record<string, unknown>): void;
    /**
     * Log warning message
     */
    warning(message: string, data?: Record<string, unknown>): void;
    /**
     * Log error message
     */
    error(message: string, error?: Error | unknown, data?: Record<string, unknown>): void;
    /**
     * Set a failed status with error message
     */
    setFailed(message: string, error?: Error | unknown): void;
    /**
     * Format log message with context and optional data
     */
    private formatMessage;
}
/**
 * Default logger instance
 */
export declare const logger: Logger;
//# sourceMappingURL=logger.d.ts.map