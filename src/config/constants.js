/**
 * Configuration constants for the Augment Agent
 */
export const ACTION_CONFIG = {
    NAME: 'Augment Agent',
};
export const INPUT_FIELD_MAP = {
    augmentSessionAuth: { envVar: 'INPUT_AUGMENT_SESSION_AUTH', required: false },
    augmentApiToken: { envVar: 'INPUT_AUGMENT_API_TOKEN', required: false },
    augmentApiUrl: { envVar: 'INPUT_AUGMENT_API_URL', required: false },
    customContext: { envVar: 'INPUT_CUSTOM_CONTEXT', required: false },
    githubToken: { envVar: 'INPUT_GITHUB_TOKEN', required: false },
    instruction: { envVar: 'INPUT_INSTRUCTION', required: false },
    instructionFile: { envVar: 'INPUT_INSTRUCTION_FILE', required: false },
    pullNumber: {
        envVar: 'INPUT_PULL_NUMBER',
        required: false,
        transform: (val) => parseInt(val, 10),
    },
    repoName: { envVar: 'INPUT_REPO_NAME', required: false },
    templateDirectory: { envVar: 'INPUT_TEMPLATE_DIRECTORY', required: false },
    templateName: { envVar: 'INPUT_TEMPLATE_NAME', required: false },
    model: { envVar: 'INPUT_MODEL', required: false },
    rules: { envVar: 'INPUT_RULES', required: false },
    mcpConfigs: { envVar: 'INPUT_MCP_CONFIGS', required: false },
};
export const TEMPLATE_CONFIG = {
    DEFAULT_TEMPLATE_NAME: 'prompt.njk',
    MAX_TEMPLATE_SIZE: 128 * 1024, // 128KB
    MAX_DIFF_SIZE: 128 * 1024, // 128KB
};
export const PATHS = {
    TEMP_DIR: '/tmp',
    DIFF_FILE_PATTERN: 'pr-{pullNumber}-diff.patch',
    INSTRUCTION_FILE: '/tmp/generated-instruction.txt',
};
export const ERROR = {
    GITHUB: {
        API_ERROR: 'GitHub API request failed',
    },
    INPUT: {
        CONFLICTING_INSTRUCTION_INPUTS: 'Cannot specify both instruction and instruction_file',
        CONFLICTING_INSTRUCTION_TEMPLATE: 'Cannot use both instruction inputs and template inputs simultaneously',
        INVALID: 'Invalid action inputs',
        INVALID_CONTEXT_JSON: 'Invalid JSON in custom_context',
        MISMATCHED_PR_FIELDS: 'Both pull_number and repo_name are required for PR extraction',
        MISSING_INSTRUCTION_OR_TEMPLATE: 'Either instruction/instruction_file or template_directory must be provided',
        REPO_FORMAT: 'Repository name must be in format "owner/repo"',
    },
    TEMPLATE: {
        MISSING_DIRECTORY: 'template_directory is required when using templates',
        NOT_FOUND: 'Template file not found',
        PATH_OUTSIDE_DIRECTORY: 'Template path is outside template directory',
        RENDER_ERROR: 'Failed to render template',
        TOO_LARGE: 'Template file exceeds maximum size',
    },
};
//# sourceMappingURL=constants.js.map