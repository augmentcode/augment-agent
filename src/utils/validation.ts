/**
 * Input validation utilities
 */

import { z } from 'zod';
import type { ActionInputs, RepoInfo } from '../types/inputs.js';
import { logger } from './logger.js';
import { ERROR, INPUT_FIELD_MAP } from '../config/constants.js';

/**
 * Zod schema for action inputs validation
 */
const ActionInputsSchema = z
  .object({
    augmentSessionAuth: z.string().optional(),
    augmentApiToken: z.string().optional(),
    augmentApiUrl: z.string().optional(),
    githubToken: z.string().optional(),
    instruction: z.string().optional(),
    instructionFile: z.string().optional(),
    templateDirectory: z.string().optional(),
    templateName: z.string().default('prompt.njk'),
    customContext: z.string().optional(),
    pullNumber: z.number().int().positive('Pull number must be a positive integer').optional(),
    repoName: z
      .string()
      .regex(/^[^\/]+\/[^\/]+$/, ERROR.INPUT.REPO_FORMAT)
      .optional(),
  })
  .refine(
    data => {
      const hasInstruction = data.instruction || data.instructionFile;
      const hasTemplate = data.templateDirectory;
      return hasInstruction || hasTemplate;
    },
    {
      message: ERROR.INPUT.MISSING_INSTRUCTION_OR_TEMPLATE,
      path: ['instruction', 'instructionFile', 'templateDirectory'],
    }
  )
  .refine(
    data => {
      const hasInstruction = data.instruction || data.instructionFile;
      const hasTemplate = data.templateDirectory;
      return !(hasInstruction && hasTemplate);
    },
    {
      message: ERROR.INPUT.CONFLICTING_INSTRUCTION_TEMPLATE,
      path: ['instruction', 'instructionFile', 'templateDirectory'],
    }
  )
  .refine(data => !(data.instruction && data.instructionFile), {
    message: ERROR.INPUT.CONFLICTING_INSTRUCTION_INPUTS,
    path: ['instruction', 'instructionFile'],
  })
  .refine(
    data => {
      const hasPullNumber = data.pullNumber !== undefined;
      const hasRepoName = data.repoName !== undefined;
      return hasPullNumber === hasRepoName;
    },
    {
      message: ERROR.INPUT.MISMATCHED_PR_FIELDS,
      path: ['pullNumber', 'repoName'],
    }
  )
  .refine(
    data => {
      if (!data.customContext) return true;
      try {
        JSON.parse(data.customContext);
        return true;
      } catch {
        return false;
      }
    },
    {
      message: ERROR.INPUT.INVALID_CONTEXT_JSON,
      path: ['customContext'],
    }
  )
  .refine(
    data => {
      const hasSessionAuth = data.augmentSessionAuth;
      const hasTokenAuth = data.augmentApiToken && data.augmentApiUrl;
      return hasSessionAuth || hasTokenAuth;
    },
    {
      message:
        'Either augment_session_auth or both augment_api_token and augment_api_url must be provided',
      path: ['augmentSessionAuth', 'augmentApiToken', 'augmentApiUrl'],
    }
  )
  .refine(
    data => {
      const hasSessionAuth = data.augmentSessionAuth;
      const hasTokenAuth = data.augmentApiToken || data.augmentApiUrl;
      return !(hasSessionAuth && hasTokenAuth);
    },
    {
      message:
        'Cannot use both augment_session_auth and augment_api_token/augment_api_url simultaneously',
      path: ['augmentSessionAuth', 'augmentApiToken', 'augmentApiUrl'],
    }
  )
  .refine(
    data => {
      if (!data.augmentSessionAuth) return true;
      try {
        JSON.parse(data.augmentSessionAuth);
        return true;
      } catch {
        return false;
      }
    },
    {
      message: 'augment_session_auth must be valid JSON',
      path: ['augmentSessionAuth'],
    }
  )
  .refine(
    data => {
      if (!data.augmentApiUrl) return true;
      try {
        new URL(data.augmentApiUrl);
        return true;
      } catch {
        return false;
      }
    },
    {
      message: 'Augment API URL must be a valid URL',
      path: ['augmentApiUrl'],
    }
  );

/**
 * Validation utilities
 */
export class ValidationUtils {
  /**
   * Validate action inputs from environment variables
   */
  static validateInputs(): ActionInputs {
    try {
      logger.debug('Reading action inputs from environment variables');

      // Build inputs object from field map
      const inputs = Object.fromEntries(
        Object.entries(INPUT_FIELD_MAP)
          .map(([key, fieldDef]) => {
            const value = process.env[fieldDef.envVar];

            // Skip optional fields if no value set
            if (!fieldDef.required && !value) {
              return null;
            }

            // Apply transformation if defined
            const transformedValue =
              fieldDef.transform && value ? fieldDef.transform(value) : value;

            return [key, transformedValue];
          })
          .filter((entry): entry is [string, any] => entry !== null)
      );

      logger.debug('Validating action inputs');
      const validated = ActionInputsSchema.parse(inputs) as ActionInputs;
      logger.debug('Action inputs validated successfully');
      return validated;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
        const message = `${ERROR.INPUT.INVALID}: ${errorMessages.join(', ')}`;
        logger.error(message, error);
        throw new Error(message);
      }
      logger.error('Unexpected validation error', error);
      throw error;
    }
  }

  /**
   * Parse repository name into owner and repo
   */
  static parseRepoName(repoName: string): RepoInfo {
    logger.debug('Parsing repository name', { repoName });

    const parts = repoName.split('/');
    if (parts.length !== 2) {
      const message = `${ERROR.INPUT.REPO_FORMAT}: ${repoName}`;
      logger.error(message);
      throw new Error(message);
    }

    const [owner, repo] = parts;
    if (!owner || !repo) {
      const message = `${ERROR.INPUT.REPO_FORMAT}: ${repoName}. Owner and repo cannot be empty`;
      logger.error(message);
      throw new Error(message);
    }

    const result = { owner, repo };
    logger.debug('Repository name parsed successfully', result);
    return result;
  }
}
