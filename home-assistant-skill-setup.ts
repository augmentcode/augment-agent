#!/usr/bin/env node

/**
 * Home Assistant Automation Skill - Setup & Entry Point
 * Integration wrapper for AnythingLLM
 */

import { HomeAssistantSkill, SkillContext, CommandResult } from './home-assistant-skill.js';

/**
 * Initialize the skill with AnythingLLM context
 */
export function initializeSkill(settings: Record<string, string>): HomeAssistantSkill {
  const context: SkillContext = {
    apiUrl: settings.HOMEASSISTANT_API_URL || process.env.HOMEASSISTANT_API_URL || '',
    apiKey: settings.HOMEASSISTANT_API_KEY || process.env.HOMEASSISTANT_API_KEY || ''
  };

  if (!context.apiUrl || !context.apiKey) {
    throw new Error(
      'Home Assistant API URL and API Key are required. ' +
      'Please configure them in AnythingLLM settings.'
    );
  }

  return new HomeAssistantSkill(context);
}

/**
 * Process user input and return command result
 * This is the main entry point for AnythingLLM
 */
export async function processCommand(
  userInput: string,
  settings: Record<string, string>
): Promise<CommandResult> {
  try {
    const skill = initializeSkill(settings);
    return await skill.execute(userInput);
  } catch (error) {
    return {
      success: false,
      message: `Skill initialization error: ${error}`
    };
  }
}

/**
 * Validate settings
 */
export function validateSettings(settings: Record<string, string>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!settings.HOMEASSISTANT_API_URL) {
    errors.push('HOMEASSISTANT_API_URL is required');
  } else if (!settings.HOMEASSISTANT_API_URL.startsWith('http://') &&
             !settings.HOMEASSISTANT_API_URL.startsWith('https://')) {
    errors.push('HOMEASSISTANT_API_URL must start with http:// or https://');
  }

  if (!settings.HOMEASSISTANT_API_KEY) {
    errors.push('HOMEASSISTANT_API_KEY is required');
  } else if (settings.HOMEASSISTANT_API_KEY.length < 10) {
    errors.push('HOMEASSISTANT_API_KEY appears to be invalid (too short)');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get skill metadata
 */
export function getSkillMetadata() {
  return {
    name: 'Home Assistant Automation',
    version: '1.0.0',
    description: 'Control your Home Assistant devices using natural language',
    author: 'Augment Code',
    license: 'MIT',
    capabilities: [
      'turn_on_device',
      'turn_off_device',
      'get_device_status',
      'set_brightness',
      'set_temperature',
      'execute_scene',
      'list_devices',
      'list_scenes'
    ],
    requiredSettings: [
      {
        key: 'HOMEASSISTANT_API_URL',
        label: 'Home Assistant API URL',
        type: 'string',
        description: 'The base URL of your Home Assistant instance',
        placeholder: 'http://localhost:8123'
      },
      {
        key: 'HOMEASSISTANT_API_KEY',
        label: 'Home Assistant API Key',
        type: 'password',
        description: 'Your Home Assistant long-lived access token',
        placeholder: 'eyJhbGc...'
      }
    ]
  };
}

/**
 * Test connection to Home Assistant
 */
export async function testConnection(
  settings: Record<string, string>
): Promise<{
  connected: boolean;
  message: string;
  error?: string;
}> {
  try {
    const validation = validateSettings(settings);
    if (!validation.valid) {
      return {
        connected: false,
        message: 'Settings validation failed',
        error: validation.errors.join(', ')
      };
    }

    const skill = initializeSkill(settings);
    const result = await skill.execute('list all devices');

    if (result.success) {
      return {
        connected: true,
        message: 'Successfully connected to Home Assistant'
      };
    } else {
      return {
        connected: false,
        message: 'Failed to connect to Home Assistant',
        error: result.message
      };
    }
  } catch (error) {
    return {
      connected: false,
      message: 'Connection test failed',
      error: String(error)
    };
  }
}

// Export types for TypeScript users
export type { SkillContext, CommandResult };
export { HomeAssistantSkill, HomeAssistantClient } from './home-assistant-skill.js';
