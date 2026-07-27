/**
 * Home Assistant API Client
 * Handles communication with Home Assistant REST API
 */

import fetch from 'node-fetch';

export interface HomeAssistantConfig {
  apiUrl: string;
  apiKey: string;
}

export interface Device {
  id: string;
  name: string;
  state: string;
  attributes?: Record<string, any>;
  entity_id: string;
}

export interface Scene {
  entity_id: string;
  friendly_name: string;
}

export class HomeAssistantClient {
  private config: HomeAssistantConfig;
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(config: HomeAssistantConfig) {
    this.config = config;
    this.baseUrl = config.apiUrl.replace(/\/$/, '');
    this.headers = {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Get all states (devices) from Home Assistant
   */
  async getStates(): Promise<Device[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/states`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Failed to get states: ${response.statusText}`);
      }

      const data = await response.json() as any[];
      return data.map(item => ({
        id: item.entity_id,
        name: item.attributes.friendly_name || item.entity_id,
        state: item.state,
        attributes: item.attributes,
        entity_id: item.entity_id
      }));
    } catch (error) {
      throw new Error(`Failed to fetch device states: ${error}`);
    }
  }

  /**
   * Get a specific device/entity state
   */
  async getState(entityId: string): Promise<Device> {
    try {
      const response = await fetch(`${this.baseUrl}/api/states/${entityId}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Device not found: ${entityId}`);
      }

      const data = await response.json() as any;
      return {
        id: data.entity_id,
        name: data.attributes.friendly_name || data.entity_id,
        state: data.state,
        attributes: data.attributes,
        entity_id: data.entity_id
      };
    } catch (error) {
      throw new Error(`Failed to fetch device state: ${error}`);
    }
  }

  /**
   * Call a service on a device
   */
  async callService(
    domain: string,
    service: string,
    data?: Record<string, any>
  ): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/services/${domain}/${service}`,
        {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify(data || {})
        }
      );

      if (!response.ok) {
        throw new Error(`Service call failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to call service: ${error}`);
    }
  }

  /**
   * Turn on a device
   */
  async turnOn(entityId: string): Promise<void> {
    const [domain] = entityId.split('.');
    await this.callService(domain, 'turn_on', { entity_id: entityId });
  }

  /**
   * Turn off a device
   */
  async turnOff(entityId: string): Promise<void> {
    const [domain] = entityId.split('.');
    await this.callService(domain, 'turn_off', { entity_id: entityId });
  }

  /**
   * Set brightness for a light
   */
  async setBrightness(entityId: string, brightness: number): Promise<void> {
    if (brightness < 0 || brightness > 255) {
      throw new Error('Brightness must be between 0 and 255');
    }
    await this.callService('light', 'turn_on', {
      entity_id: entityId,
      brightness
    });
  }

  /**
   * Set color for a light (RGB)
   */
  async setColor(
    entityId: string,
    red: number,
    green: number,
    blue: number
  ): Promise<void> {
    await this.callService('light', 'turn_on', {
      entity_id: entityId,
      rgb_color: [red, green, blue]
    });
  }

  /**
   * Set temperature for a climate device
   */
  async setTemperature(entityId: string, temperature: number): Promise<void> {
    await this.callService('climate', 'set_temperature', {
      entity_id: entityId,
      temperature
    });
  }

  /**
   * Activate a scene
   */
  async activateScene(sceneId: string): Promise<void> {
    await this.callService('scene', 'turn_on', { entity_id: sceneId });
  }

  /**
   * Get all available scenes
   */
  async getScenes(): Promise<Scene[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/states`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Failed to get scenes: ${response.statusText}`);
      }

      const data = await response.json() as any[];
      return data
        .filter(item => item.entity_id.startsWith('scene.'))
        .map(item => ({
          entity_id: item.entity_id,
          friendly_name: item.attributes.friendly_name || item.entity_id
        }));
    } catch (error) {
      throw new Error(`Failed to fetch scenes: ${error}`);
    }
  }

  /**
   * Get all automations
   */
  async getAutomations(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/states`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Failed to get automations: ${response.statusText}`);
      }

      const data = await response.json() as any[];
      return data.filter(item => item.entity_id.startsWith('automation.'));
    } catch (error) {
      throw new Error(`Failed to fetch automations: ${error}`);
    }
  }
}
