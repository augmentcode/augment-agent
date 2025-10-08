/**
 * Configuration constants for the Augment Agent
 */
import type { InputField } from '../types/inputs.js';
export declare const ACTION_CONFIG: {
    NAME: string;
};
export declare const INPUT_FIELD_MAP: Record<string, InputField>;
export declare const TEMPLATE_CONFIG: {
    DEFAULT_TEMPLATE_NAME: string;
    MAX_TEMPLATE_SIZE: number;
    MAX_DIFF_SIZE: number;
};
export declare const PATHS: {
    TEMP_DIR: string;
    DIFF_FILE_PATTERN: string;
    INSTRUCTION_FILE: string;
};
export declare const ERROR: {
    readonly GITHUB: {
        readonly API_ERROR: "GitHub API request failed";
    };
    readonly INPUT: {
        readonly CONFLICTING_INSTRUCTION_INPUTS: "Cannot specify both instruction and instruction_file";
        readonly CONFLICTING_INSTRUCTION_TEMPLATE: "Cannot use both instruction inputs and template inputs simultaneously";
        readonly INVALID: "Invalid action inputs";
        readonly INVALID_CONTEXT_JSON: "Invalid JSON in custom_context";
        readonly MISMATCHED_PR_FIELDS: "Both pull_number and repo_name are required for PR extraction";
        readonly MISSING_INSTRUCTION_OR_TEMPLATE: "Either instruction/instruction_file or template_directory must be provided";
        readonly REPO_FORMAT: "Repository name must be in format \"owner/repo\"";
    };
    readonly TEMPLATE: {
        readonly MISSING_DIRECTORY: "template_directory is required when using templates";
        readonly NOT_FOUND: "Template file not found";
        readonly PATH_OUTSIDE_DIRECTORY: "Template path is outside template directory";
        readonly RENDER_ERROR: "Failed to render template";
        readonly TOO_LARGE: "Template file exceeds maximum size";
    };
};
//# sourceMappingURL=constants.d.ts.map