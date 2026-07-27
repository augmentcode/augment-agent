/**
 * Home Assistant Automation Skill
 * AnythingLLM skill for controlling Home Assistant devices
 */

import { HomeAssistantClient, HomeAssistantConfig } from './home-assistant-client.js';

export interface SkillContext {
  apiUrl: string;
  apiKey: string;
}

export interface CommandResult {
  success: boolean;
  message: string;
  data?: any;
}

export class HomeAssistantSkill {
  private client: HomeAssistantClient;
  private deviceCache: Map<string, any> = new Map();
  private lastCacheUpdate: number = 0;
  private cacheTimeMs: number = 5000; // 5 seconds

  constructor(context: SkillContext) {
    const config: HomeAssistantConfig = {
      apiUrl: context.apiUrl,
      apiKey: context.apiKey
    };
    this.client = new HomeAssistantClient(config);
  }

  /**
   * Parse user input and execute the appropriate action
   */
  async execute(userInput: string): Promise<CommandResult> {
    try {
      const intent = this.parseIntent(userInput);

      switch (intent.action) {
        case 'turn_on':
          return await this.handleTurnOn(intent.target);
        case 'turn_off':
          return await this.handleTurnOff(intent.target);
        case 'get_status':
          return await this.handleGetStatus(intent.target);
        case 'set_brightness':
          return await this.handleSetBrightness(intent.target, intent.value);
        case 'set_temperature':
          return await this.handleSetTemperature(intent.target, intent.value);
        case 'activate_scene':
          return await this.handleActivateScene(intent.target);
        case 'list_devices':
          return await this.handleListDevices();
        case 'list_scenes':
          return await this.handleListScenes();
        default:
          return {
            success: false,
            message: `Unknown action: ${intent.action}`
          };
      }
    } catch (error) {
      return {
        success: false,
        message: `Error executing command: ${error}`
      };
    }
  }

  /**
   * Parse user input to extract intent and parameters
   */
  private parseIntent(input: string): any {
    const lowerInput = input.toLowerCase();

    // Turn on patterns
    if (
      lowerInput.match(/turn\s+on|switch\s+on|enable/) &&
      !lowerInput.match(/turn\s+off|switch\s+off|disable/)
    ) {
      return {
        action: 'turn_on',
        target: this.extractDevice(input)
      };
    }

    // Turn off patterns
    if (lowerInput.match(/turn\s+off|switch\s+off|disable/)) {
      return {
        action: 'turn_off',
        target: this.extractDevice(input)
      };
    }

    // Set brightness patterns
    if (lowerInput.match(/brightness|dim|bright|set.*light/)) {
      const valueMatch = input.match(/(\d+)%?/);
      return {
        action: 'set_brightness',
        target: this.extractDevice(input),
        value: valueMatch ? parseInt(valueMatch[1]) : 50
      };
    }

    // Set temperature patterns
    if (lowerInput.match(/temperature|degrees?|set.*heat|set.*cool/)) {
      const valueMatch = input.match(/(\d+)/);
      return {
        action: 'set_temperature',
        target: this.extractDevice(input),
        value: valueMatch ? parseInt(valueMatch[1]) : 20
      };
    }

    // Activate scene patterns
    if (lowerInput.match(/scene|activate|start/)) {
      return {
        action: 'activate_scene',
        target: this.extractDevice(input)
      };
    }

    // List devices patterns
    if (lowerInput.match(/list.*device|show.*device|what.*device/)) {
      return { action: 'list_devices' };
    }

    // List scenes patterns
    if (lowerInput.match(/list.*scene|show.*scene|what.*scene/)) {
      return { action: 'list_scenes' };
    }

    // Get status patterns
    if (lowerInput.match(/status|state|check|is.*on|is.*off/)) {
      return {
        action: 'get_status',
        target: this.extractDevice(input)
      };
    }

    return { action: 'unknown' };
  }

  /**
   * Extract device name/id from user input
   */
  private extractDevice(input: string): string {
    // Remove common action words
    let cleaned = input
      .replace(/turn\s+(on|off)/gi, '')
      .replace(/switch\s+(on|off)/gi, '')
      .replace(/enable|disable|brightness|dim|bright|set\s+/gi, '')
      .replace(/temperature|degrees?/gi, '')
      .replace(/the\s+/gi, '')
      .trim();

    return cleaned;
  }

  /**
   * Handle turn on command
   */
  private async handleTurnOn(device: string): Promise<CommandResult> {
    try {
      const entityId = await this.findEntity(device);
      if (!entityId) {
        return {
          success: false,
          message: `Device not found: ${device}`
        };
      }

      await this.client.turnOn(entityId);
      return {
        success: true,
        message: `Turned on ${device}`
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to turn on ${device}: ${error}`
      };
    }
  }

  /**
   * Handle turn off command
   */
  private async handleTurnOff(device: string): Promise<CommandResult> {
    try {
      const entityId = await this.findEntity(device);
      if (!entityId) {
        return {
          success: false,
          message: `Device not found: ${device}`
        };
      }

      await this.client.turnOff(entityId);
      return {
        success: true,
        message: `Turned off ${device}`
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to turn off ${device}: ${error}`
      };
    }
  }

  /**
   * Handle get status command
   */
  private async handleGetStatus(device: string): Promise<CommandResult> {
    try {
      const entityId = await this.findEntity(device);
      if (!entityId) {
        return {
          success: false,
          message: `Device not found: ${device}`
        };
      }

      const state = await this.client.getState(entityId);
      return {
        success: true,
        message: `${state.name} is ${state.state}`,
        data: state
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to get status: ${error}`
      };
    }
  }

  /**
   * Handle set brightness command
   */
  private async handleSetBrightness(
    device: string,
    brightness: number
  ): Promise<CommandResult> {
    try {
      const entityId = await this.findEntity(device);
      if (!entityId) {
        return {
          success: false,
          message: `Device not found: ${device}`
        };
      }

      await this.client.setBrightness(entityId, brightness);
      return {
        success: true,
        message: `Set ${device} brightness to ${brightness}`
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to set brightness: ${error}`
      };
    }
  }

  /**
   * Handle set temperature command
   */
  private async handleSetTemperature(
    device: string,
    temperature: number
  ): Promise<CommandResult> {
    try {
      const entityId = await this.findEntity(device);
      if (!entityId) {
        return {
          success: false,
          message: `Device not found: ${device}`
        };
      }

      await this.client.setTemperature(entityId, temperature);
      return {
        success: true,
        message: `Set ${device} temperature to ${temperature}°`
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to set temperature: ${error}`
      };
    }
  }

  /**
   * Handle activate scene command
   */
  private async handleActivateScene(scene: string): Promise<CommandResult> {
    try {
      const sceneId = await this.findEntity(scene, 'scene');
      if (!sceneId) {
        return {
          success: false,
          message: `Scene not found: ${scene}`
        };
      }

      await this.client.activateScene(sceneId);
      return {
        success: true,
        message: `Activated scene: ${scene}`
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to activate scene: ${error}`
      };
    }
  }

  /**
   * Handle list devices command
   */
  private async handleListDevices(): Promise<CommandResult> {
    try {
      const devices = await this.client.getStates();
      const deviceList = devices
        .map(d => `- ${d.name} (${d.entity_id}): ${d.state}`)
        .join('\n');

      return {
        success: true,
        message: `Available devices:\n${deviceList}`,
        data: devices
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to list devices: ${error}`
      };
    }
  }

  /**
   * Handle list scenes command
   */
  private async handleListScenes(): Promise<CommandResult> {
    try {
      const scenes = await this.client.getScenes();
      const sceneList = scenes
        .map(s => `- ${s.friendly_name} (${s.entity_id})`)
        .join('\n');

      return {
        success: true,
        message: `Available scenes:\n${sceneList}`,
        data: scenes
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to list scenes: ${error}`
      };
    }
  }

  /**
   * Find entity ID by friendly name or entity ID
   */
  private async findEntity(
    query: string,
    domain?: string
  ): Promise<string | null> {
    const now = Date.now();
    if (now - this.lastCacheUpdate > this.cacheTimeMs || this.deviceCache.size === 0) {
      await this.updateDeviceCache();
      this.lastCacheUpdate = now;
    }

    const lowerQuery = query.toLowerCase();

    // Search by entity ID
    for (const [entityId, device] of this.deviceCache.entries()) {
      if (domain && !entityId.startsWith(domain + '.')) continue;
      if (entityId.toLowerCase() === lowerQuery) return entityId;
    }

    // Search by friendly name
    for (const [entityId, device] of this.deviceCache.entries()) {
      if (domain && !entityId.startsWith(domain + '.')) continue;
      if (device.name.toLowerCase().includes(lowerQuery)) return entityId;
    }

    // Partial match
    for (const [entityId, device] of this.deviceCache.entries()) {
      if (domain && !entityId.startsWith(domain + '.')) continue;
      if (lowerQuery.includes(device.name.toLowerCase())) return entityId;
      if (device.name.toLowerCase().includes(lowerQuery)) return entityId;
    }

    return null;
  }

  /**
   * Update device cache
   */
  private async updateDeviceCache(): Promise<void> {
    const devices = await this.client.getStates();
    this.deviceCache.clear();
    for (const device of devices) {
      this.deviceCache.set(device.entity_id, device);
    }
  }
}
