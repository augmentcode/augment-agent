/**
 * Home Assistant Skill - Usage Examples
 * Demonstrates how to use the skill programmatically
 */

import {
  initializeSkill,
  processCommand,
  validateSettings,
  testConnection,
  getSkillMetadata
} from './home-assistant-skill-setup.js';

// Example settings (in real usage, these come from AnythingLLM)
const skillSettings = {
  HOMEASSISTANT_API_URL: 'http://localhost:8123',
  HOMEASSISTANT_API_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
};

/**
 * Example 1: Validate settings before using
 */
async function exampleValidateSettings() {
  console.log('=== Example 1: Validate Settings ===');
  const validation = validateSettings(skillSettings);
  console.log('Valid:', validation.valid);
  if (!validation.valid) {
    console.log('Errors:', validation.errors);
  }
  console.log();
}

/**
 * Example 2: Test connection to Home Assistant
 */
async function exampleTestConnection() {
  console.log('=== Example 2: Test Connection ===');
  const result = await testConnection(skillSettings);
  console.log('Connected:', result.connected);
  console.log('Message:', result.message);
  if (result.error) {
    console.log('Error:', result.error);
  }
  console.log();
}

/**
 * Example 3: Get skill metadata
 */
async function exampleGetMetadata() {
  console.log('=== Example 3: Get Skill Metadata ===');
  const metadata = getSkillMetadata();
  console.log('Name:', metadata.name);
  console.log('Version:', metadata.version);
  console.log('Capabilities:', metadata.capabilities);
  console.log();
}

/**
 * Example 4: Turn on a device
 */
async function exampleTurnOnDevice() {
  console.log('=== Example 4: Turn On Device ===');
  const result = await processCommand(
    'turn on the living room lights',
    skillSettings
  );
  console.log('Success:', result.success);
  console.log('Message:', result.message);
  console.log();
}

/**
 * Example 5: Turn off a device
 */
async function exampleTurnOffDevice() {
  console.log('=== Example 5: Turn Off Device ===');
  const result = await processCommand(
    'turn off the bedroom fan',
    skillSettings
  );
  console.log('Success:', result.success);
  console.log('Message:', result.message);
  console.log();
}

/**
 * Example 6: Get device status
 */
async function exampleGetDeviceStatus() {
  console.log('=== Example 6: Get Device Status ===');
  const result = await processCommand(
    'what is the status of the kitchen light',
    skillSettings
  );
  console.log('Success:', result.success);
  console.log('Message:', result.message);
  if (result.data) {
    console.log('Device State:', result.data);
  }
  console.log();
}

/**
 * Example 7: Set brightness
 */
async function exampleSetBrightness() {
  console.log('=== Example 7: Set Brightness ===');
  const result = await processCommand(
    'set the living room lights to 150 brightness',
    skillSettings
  );
  console.log('Success:', result.success);
  console.log('Message:', result.message);
  console.log();
}

/**
 * Example 8: Set temperature
 */
async function exampleSetTemperature() {
  console.log('=== Example 8: Set Temperature ===');
  const result = await processCommand(
    'set the thermostat to 72 degrees',
    skillSettings
  );
  console.log('Success:', result.success);
  console.log('Message:', result.message);
  console.log();
}

/**
 * Example 9: Activate a scene
 */
async function exampleActivateScene() {
  console.log('=== Example 9: Activate Scene ===');
  const result = await processCommand(
    'activate the movie scene',
    skillSettings
  );
  console.log('Success:', result.success);
  console.log('Message:', result.message);
  console.log();
}

/**
 * Example 10: List all devices
 */
async function exampleListDevices() {
  console.log('=== Example 10: List All Devices ===');
  const result = await processCommand(
    'list all devices',
    skillSettings
  );
  console.log('Success:', result.success);
  console.log('Message:', result.message);
  if (result.data) {
    console.log('Total Devices:', (result.data as any[]).length);
  }
  console.log();
}

/**
 * Example 11: List all scenes
 */
async function exampleListScenes() {
  console.log('=== Example 11: List All Scenes ===');
  const result = await processCommand(
    'list all scenes',
    skillSettings
  );
  console.log('Success:', result.success);
  console.log('Message:', result.message);
  if (result.data) {
    console.log('Total Scenes:', (result.data as any[]).length);
  }
  console.log();
}

/**
 * Example 12: Error handling
 */
async function exampleErrorHandling() {
  console.log('=== Example 12: Error Handling ===');
  const badSettings = {
    HOMEASSISTANT_API_URL: '',
    HOMEASSISTANT_API_KEY: ''
  };

  try {
    const result = await processCommand(
      'turn on lights',
      badSettings
    );
    console.log('Success:', result.success);
    console.log('Message:', result.message);
  } catch (error) {
    console.error('Error caught:', error);
  }
  console.log();
}

/**
 * Example 13: Multiple commands in sequence
 */
async function exampleCommandSequence() {
  console.log('=== Example 13: Command Sequence ===');
  const commands = [
    'list all devices',
    'turn on the living room lights',
    'set the living room lights to 200 brightness',
    'what is the status of the living room lights'
  ];

  for (const command of commands) {
    console.log(`\nExecuting: "${command}"`);
    const result = await processCommand(command, skillSettings);
    console.log('Result:', result.success ? 'Success' : 'Failed');
    console.log('Message:', result.message);
  }
  console.log();
}

/**
 * Example 14: Programmatic skill initialization
 */
async function exampleDirectInitialization() {
  console.log('=== Example 14: Direct Skill Initialization ===');
  try {
    const skill = initializeSkill(skillSettings);
    const result = await skill.execute('list all devices');
    console.log('Success:', result.success);
    console.log('Message:', result.message);
  } catch (error) {
    console.error('Error:', error);
  }
  console.log();
}

/**
 * Run all examples
 */
async function runAllExamples() {
  console.log('Home Assistant Skill - Usage Examples\n');
  console.log('========================================\n');

  try {
    await exampleValidateSettings();
    await exampleGetMetadata();
    // Skip connection test in examples to avoid real API calls
    // await exampleTestConnection();

    // Other examples would require actual Home Assistant instance
    console.log('Note: The following examples require a working Home Assistant instance:\n');
    console.log('- exampleTurnOnDevice()');
    console.log('- exampleTurnOffDevice()');
    console.log('- exampleGetDeviceStatus()');
    console.log('- exampleSetBrightness()');
    console.log('- exampleSetTemperature()');
    console.log('- exampleActivateScene()');
    console.log('- exampleListDevices()');
    console.log('- exampleListScenes()');
    console.log('- exampleCommandSequence()');
    console.log('- exampleDirectInitialization()');

    console.log('\n========================================');
    console.log('Examples complete');
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Run examples if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllExamples().catch(console.error);
}

export {
  exampleValidateSettings,
  exampleTestConnection,
  exampleGetMetadata,
  exampleTurnOnDevice,
  exampleTurnOffDevice,
  exampleGetDeviceStatus,
  exampleSetBrightness,
  exampleSetTemperature,
  exampleActivateScene,
  exampleListDevices,
  exampleListScenes,
  exampleErrorHandling,
  exampleCommandSequence,
  exampleDirectInitialization
};
