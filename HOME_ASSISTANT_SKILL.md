# Home Assistant Automation Skill

An AnythingLLM agent skill that enables you to automate and control your Home Assistant devices using natural language commands.

## Features

- **Device Control**: Turn devices on/off, adjust settings
- **Brightness Control**: Adjust light brightness (0-255)
- **Temperature Control**: Set climate device temperatures
- **Scene Activation**: Activate pre-configured Home Assistant scenes
- **Device Discovery**: List all available devices and scenes
- **Natural Language**: Understand and execute commands in plain English
- **Smart Matching**: Intelligently match user input to devices and scenes

## Installation

### Step 1: Get Your Home Assistant API Token

1. Open your Home Assistant instance in a web browser
2. Go to **Profile** → **Security** (at the bottom of the left sidebar)
3. Scroll down to **Long-Lived Access Tokens**
4. Click **Create Token**
5. Give it a name like "AnythingLLM"
6. Copy the generated token

> ⚠️ **Security Note**: Treat this token like a password. Never share it or commit it to version control.

### Step 2: Install in AnythingLLM

1. Open AnythingLLM
2. Go to **Settings** → **Agent Skills**
3. Click **Import Skill**
4. Enter the import ID: `home-assistant-automation`
5. Click **Import**

### Step 3: Configure the Skill

1. Once imported, find the skill in the **Installed Skills** list
2. Click the **Settings** icon ⚙️
3. Fill in the following fields:
   - **Home Assistant API URL**: `http://localhost:8123` (or your instance URL)
   - **Home Assistant API Key**: Paste the token from Step 1
4. Click **Save**

### Step 4: Activate the Skill

Toggle the skill to **Enabled** in the **Agent Skills** section.

## Usage Examples

### Basic Commands

```
@agent turn on the living room lights
@agent turn off the bedroom fan
@agent what's the status of the front door
```

### Brightness Control

```
@agent set the kitchen lights to 50% brightness
@agent dim the bedroom lights to 25%
@agent brighten the hallway lights
```

### Temperature Control

```
@agent set the thermostat to 72 degrees
@agent set the bedroom temperature to 68
```

### Scene Activation

```
@agent activate the movie scene
@agent start the goodnight scene
@agent activate reading scene
```

### Device Discovery

```
@agent list all devices
@agent show me all available scenes
@agent what devices do I have
```

## Supported Device Types

The skill can control any Home Assistant entity, including:

- **Light**: Bulbs, strip lights, color lights
- **Switch**: Smart switches, plugs
- **Climate**: Thermostats, heating/cooling systems
- **Cover**: Blinds, shutters, garage doors
- **Climate**: Temperature sensors
- **Automation**: Home Assistant automations
- **Scene**: Pre-configured scenes

## Advanced Features

### Intent Recognition

The skill automatically recognizes various command patterns:

- **Turn On**: "turn on", "switch on", "enable"
- **Turn Off**: "turn off", "switch off", "disable"
- **Brightness**: "set brightness", "dim", "brighten"
- **Temperature**: "set temperature", "set to X degrees"
- **Scenes**: "activate scene", "start scene"
- **Status**: "what's the status", "is it on", "check device"

### Device Name Matching

The skill matches device names using:

1. Exact entity ID match (e.g., `light.living_room`)
2. Friendly name match (e.g., "Living Room Light")
3. Partial name matching (e.g., "living room" matches "Living Room Light")

### Caching

Device information is cached for 5 seconds to reduce API calls to Home Assistant.

## Troubleshooting

### Connection Issues

**Problem**: "Failed to connect to Home Assistant"

**Solution**:
1. Verify the API URL is correct (check your Home Assistant URL in settings)
2. Ensure Home Assistant is running and accessible
3. Check that the API URL includes the protocol (http:// or https://)
4. If using HTTPS, ensure your certificate is valid

### Authentication Issues

**Problem**: "Unauthorized" or "Invalid API key"

**Solution**:
1. Verify the API token is correct (regenerate if needed)
2. Ensure you're using a Long-Lived Access Token, not a regular token
3. Check that the token has not expired
4. Ensure the token is copied completely without extra spaces

### Device Not Found

**Problem**: Skill says "Device not found"

**Solution**:
1. Check the exact device name using `@agent list all devices`
2. Use the friendly name or entity ID
3. Some devices may not be directly controllable (sensor-only devices)

### No Response

**Problem**: Skill takes too long to respond

**Solution**:
1. Check your network connection
2. Verify Home Assistant is not overloaded
3. Try again - the first request may take longer if the cache has expired

## Configuration Reference

### Required Settings

| Setting | Description | Example |
|---------|-------------|---------|
| `HOMEASSISTANT_API_URL` | Your Home Assistant instance URL | `http://localhost:8123` |
| `HOMEASSISTANT_API_KEY` | Long-lived access token | `eyJhbGc...` |

## API Reference

### Commands

#### Turn On Device

```
Turn on [device name]
```

**Example**: "Turn on the kitchen lights"

#### Turn Off Device

```
Turn off [device name]
```

**Example**: "Turn off the bedroom fan"

#### Get Device Status

```
What's the status of [device name]
```

**Example**: "What's the status of the front door"

#### Set Brightness

```
Set [device name] brightness to [0-255]
```

**Example**: "Set the living room lights to 150 brightness"

#### Set Temperature

```
Set [device name] temperature to [degrees]
```

**Example**: "Set the thermostat to 72 degrees"

#### Activate Scene

```
Activate [scene name]
```

**Example**: "Activate the movie scene"

#### List Devices

```
List all devices
```

#### List Scenes

```
List all scenes
```

## Security Considerations

1. **API Token**: Keep your API token secure. Treat it like a password.
2. **Network**: Ensure your Home Assistant instance is properly secured with authentication.
3. **HTTPS**: Use HTTPS for remote connections.
4. **Firewall**: Only expose Home Assistant API to trusted networks.
5. **Token Rotation**: Periodically regenerate your API token.

## Limitations

- Device control depends on Home Assistant's permissions for the token
- Some devices may have limited automation capabilities in Home Assistant
- Complex automations may require direct Home Assistant automation creation
- Rate limiting: Excessive commands may be throttled by Home Assistant

## Support

For issues or feature requests, please check:
1. Home Assistant documentation: https://www.home-assistant.io/
2. AnythingLLM documentation: https://docs.anythingllm.com/
3. Skill repository issues

## License

MIT - See LICENSE file for details

## Changelog

### v1.0.0
- Initial release
- Device control (turn on/off)
- Brightness adjustment
- Temperature control
- Scene activation
- Device discovery
- Natural language intent recognition
