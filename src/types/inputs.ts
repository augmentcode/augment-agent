/**
 * Action input types for the Augment Agent with template support
 */

export interface InputField {
  envVar: string;
  required: boolean;
  transform?: (value: string) => any;
}

export interface ActionInputs {
  // Base inputs
  augmentSessionAuth?: string | undefined;
  augmentApiToken?: string | undefined;
  augmentApiUrl?: string | undefined;
  githubToken?: string | undefined;
  instruction?: string | undefined;
  instructionFile?: string | undefined;
  model?: string | undefined;

  // Template inputs
  templateDirectory?: string | undefined;
  templateName?: string | undefined;
  customContext?: string | undefined;
  pullNumber?: number | undefined;
  repoName?: string | undefined;

  // Additional configuration inputs
  rules?: string[] | undefined;
  mcpConfigs?: string[] | undefined;
}

export interface RepoInfo {
  owner: string;
  repo: string;
}
