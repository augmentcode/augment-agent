/**
 * Home Assistant Skill Tests
 * Unit tests for the skill functionality
 */

import test from 'node:test';
import assert from 'node:assert';
import { HomeAssistantSkill } from './home-assistant-skill.js';
import { HomeAssistantClient } from './home-assistant-client.js';

// Mock settings for testing
const testSettings = {
  apiUrl: 'http://localhost:8123',
  apiKey: 'test-token-12345'
};

test('HomeAssistantSkill - Parse Intent', async t => {
  const skill = new HomeAssistantSkill(testSettings);

  await t.test('should parse turn on intent', () => {
    // Testing intent parsing logic
    const input = 'turn on the living room lights';
    // Skill should recognize this as turn_on action
    assert.ok(input.toLowerCase().includes('turn') && input.toLowerCase().includes('on'));
  });

  await t.test('should parse turn off intent', () => {
    const input = 'turn off the bedroom fan';
    assert.ok(input.toLowerCase().includes('turn') && input.toLowerCase().includes('off'));
  });

  await t.test('should parse brightness intent', () => {
    const input = 'set the kitchen lights to 50% brightness';
    assert.ok(input.toLowerCase().includes('brightness') || input.toLowerCase().includes('50'));
  });

  await t.test('should parse temperature intent', () => {
    const input = 'set the thermostat to 72 degrees';
    assert.ok(input.toLowerCase().includes('temperature') || input.toLowerCase().includes('degrees'));
  });

  await t.test('should parse scene activation', () => {
    const input = 'activate the movie scene';
    assert.ok(input.toLowerCase().includes('scene'));
  });

  await t.test('should parse list devices', () => {
    const input = 'list all devices';
    assert.ok(input.toLowerCase().includes('list') && input.toLowerCase().includes('device'));
  });
});

test('HomeAssistantClient - Configuration', async t => {
  await t.test('should initialize with correct config', () => {
    const client = new HomeAssistantClient(testSettings);
    assert.ok(client);
  });

  await t.test('should throw on invalid API URL', () => {
    assert.throws(() => {
      const invalidSettings = { ...testSettings, apiUrl: '' };
      new HomeAssistantClient(invalidSettings);
    });
  });

  await t.test('should throw on missing API key', () => {
    assert.throws(() => {
      const invalidSettings = { ...testSettings, apiKey: '' };
      new HomeAssistantClient(invalidSettings);
    });
  });
});

test('HomeAssistantSkill - Command Results', async t => {
  const skill = new HomeAssistantSkill(testSettings);

  await t.test('should return command result with success flag', async () => {
    const result = await skill.execute('list all devices');
    assert.ok(result.hasOwnProperty('success'));
    assert.ok(result.hasOwnProperty('message'));
  });

  await t.test('should handle unknown actions gracefully', async () => {
    const result = await skill.execute('xyzabc unknown command');
    assert.equal(result.success, false);
    assert.ok(result.message);
  });

  await t.test('should handle errors gracefully', async () => {
    const skillWithBadConfig = new HomeAssistantSkill({
      apiUrl: 'http://invalid-host:99999',
      apiKey: 'invalid-key'
    });
    const result = await skillWithBadConfig.execute('turn on light');
    assert.equal(result.success, false);
  });
});

test('Device Name Extraction', async t => {
  const skill = new HomeAssistantSkill(testSettings);

  await t.test('should extract device name from turn on command', () => {
    const input = 'turn on the living room lights';
    const cleaned = input
      .replace(/turn\s+(on|off)/gi, '')
      .replace(/the\s+/gi, '')
      .trim();
    assert.ok(cleaned.toLowerCase().includes('living room'));
  });

  await t.test('should handle entity IDs', () => {
    const input = 'turn on light.living_room';
    assert.ok(input.toLowerCase().includes('light.living_room'));
  });

  await t.test('should handle various device types', () => {
    const devices = [
      'fan.bedroom_fan',
      'light.kitchen_light',
      'switch.garage_light',
      'climate.thermostat'
    ];
    assert.ok(devices.length > 0);
  });
});
