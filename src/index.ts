#!/usr/bin/env node

/**
 * Augment Agent GitHub Action
 * Main entry point for the action
 */

import { spawn, SpawnOptions } from 'child_process';
import process from 'process';
import { ValidationUtils } from './utils/validation.js';
import { TemplateProcessor } from './template/template-processor.js';
import { logger } from './utils/logger.js';
import { ActionInputs } from './types/inputs.js';

/**
 * Execute a shell command and return a promise
 */
function execCommand(
  command: string,
  args: string[] = [],
  options: SpawnOptions = {}
): Promise<number> {
  return new Promise((resolve, reject) => {
    // Join command and args into a single shell command for proper quoting
    const fullCommand = `${command} ${args
      .map(arg => {
        // Properly quote arguments that contain spaces or special characters
        if (arg.includes(' ') || arg.includes('"') || arg.includes("'")) {
          return `"${arg.replace(/"/g, '\\"')}"`;
        }
        return arg;
      })
      .join(' ')}`;

    const child = spawn(fullCommand, [], {
      stdio: 'inherit',
      shell: true,
      ...options,
    });

    child.on('close', code => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on('error', error => {
      reject(error);
    });
  });
}

/**
 * Set up environment variables for the augment script
 */
function setupEnvironment(inputs: ActionInputs): void {
  // Set authentication environment variables
  if (inputs.augmentSessionAuth) {
    // Use session authentication
    process.env.AUGMENT_SESSION_AUTH = inputs.augmentSessionAuth;
  } else {
    // Use token + URL authentication
    process.env.AUGMENT_API_TOKEN = inputs.augmentApiToken;
    process.env.AUGMENT_API_URL = inputs.augmentApiUrl;
  }

  // Set GitHub token if provided
  if (inputs.githubToken) {
    process.env.GITHUB_API_TOKEN = inputs.githubToken;
  }
}

/**
 * Process templates and generate instruction file
 */
async function processTemplate(inputs: ActionInputs): Promise<string> {
  logger.info('Preparing template', {
    templateDirectory: inputs.templateDirectory,
    templateName: inputs.templateName,
  });

  // Create and run template processor
  const processor = TemplateProcessor.create(inputs);
  const instructionFilePath = await processor.processTemplate(inputs);

  logger.info('Template processing completed', {
    instructionFile: instructionFilePath,
  });

  return instructionFilePath;
}

/**
 * Run the augment script with appropriate arguments
 */
async function runAugmentScript(inputs: ActionInputs): Promise<void> {
  let instruction_value: string;
  let is_file: boolean;
  if (inputs.instruction) {
    instruction_value = inputs.instruction;
    is_file = false;
    logger.debug('Using direct instruction', { instruction: inputs.instruction });
  } else if (inputs.instructionFile) {
    instruction_value = inputs.instructionFile;
    is_file = true;
    logger.debug('Using instruction file', { instructionFile: inputs.instructionFile });
  } else {
    instruction_value = await processTemplate(inputs);
    is_file = true;
    logger.debug('Using template-generated instruction file', {
      instructionFile: instruction_value,
    });
  }
  const args = ['--print'];
  if (inputs.model && inputs.model.trim().length > 0) {
    args.push('--model', inputs.model.trim());
  }
  if (is_file) {
    logger.info(`📄 Using instruction file: ${instruction_value}`);
    args.push('--instruction-file', instruction_value);
  } else {
    logger.info('📝 Using direct instruction');
    args.push('--instruction', instruction_value);
  }

  const uniqueRules = Array.from(new Set(inputs.rules ?? [])).filter(rule => rule.length > 0);
  if (uniqueRules.length > 0) {
    logger.info(`🔧 Applying ${uniqueRules.length} rule file(s)`);
    for (const rulePath of uniqueRules) {
      logger.info(`  - ${rulePath}`);
      args.push('--rules', rulePath);
    }
  }

  const uniqueMcpConfigs = Array.from(new Set(inputs.mcpConfigs ?? [])).filter(
    config => config.length > 0
  );
  if (uniqueMcpConfigs.length > 0) {
    logger.info(`🧩 Applying ${uniqueMcpConfigs.length} MCP config file(s)`);
    for (const configPath of uniqueMcpConfigs) {
      logger.info(`  - ${configPath}`);
      args.push('--mcp-config', configPath);
    }
  }

  await execCommand('auggie', args);
  logger.info('✅ Augment Agent completed successfully');
}

/**
 * Main function
 */
async function main(): Promise<void> {
  try {
    logger.info('🔍 Validating inputs...');
    const inputs = ValidationUtils.validateInputs();

    logger.info('⚙️ Setting up environment...');
    setupEnvironment(inputs);

    logger.info('🚀 Starting Augment Agent...');
    await runAugmentScript(inputs);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.setFailed(errorMessage);
  }
}

// Run the action only if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.setFailed(`Unexpected error: ${errorMessage}`);
  });
}
