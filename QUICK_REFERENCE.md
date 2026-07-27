# Home Assistant Automation Skill - Quick Reference

## Setup Checklist
- [ ] Get your Home Assistant API token from Profile → Security
- [ ] Install skill via AnythingLLM Community Hub
- [ ] Configure API URL and Key in skill settings
- [ ] Enable the skill in Agent Skills
- [ ] Test connection with: `@agent list all devices`

## Common Commands

### Device Control
| Command | Example |
|---------|---------|
| Turn on | `@agent turn on the living room lights` |
| Turn off | `@agent turn off the bedroom fan` |
| Status | `@agent what's the status of the kitchen light` |

### Lighting Control
| Command | Example |
|---------|---------|
| Set brightness | `@agent set the bedroom lights to 50% brightness` |
| Dim lights | `@agent dim the hallway lights` |
| Brighten | `@agent brighten the porch lights` |

### Climate Control
| Command | Example |
|---------|---------|
| Set temperature | `@agent set the thermostat to 72 degrees` |
| Warm up | `@agent set the bedroom temperature to 70` |

### Scenes & Automation
| Command | Example |
|---------|---------|
| Activate scene | `@agent activate the movie scene` |
| Start goodnight | `@agent activate the goodnight scene` |

### Discovery
| Command | Example |
|---------|---------|
| List devices | `@agent list all devices` |
| Show scenes | `@agent show me all scenes` |

## Supported Device Types
- **Lights**: RGB lights, dimmers, strips
- **Switches**: Smart switches, outlets, plugs
- **Climate**: Thermostats, AC units
- **Covers**: Blinds, shutters, garage doors
- **Scenes**: Pre-configured automations
- **Fans**: Smart fans with speed control

## Device Naming Tips
- Use friendly names: "Living Room Light"
- Or entity IDs: "light.living_room"
- The skill matches partial names intelligently
- Example: "living room" will find "Living Room Light"

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Device not found" | Use `@agent list all devices` to see exact names |
| "Connection failed" | Check API URL starts with http:// or https:// |
| "Unauthorized" | Verify API token is a Long-Lived Access Token |
| "No response" | Check Home Assistant is running and accessible |

## Natural Language Examples

**These all work the same way:**
- "Turn on the lights"
- "Switch on the living room lights"
- "Enable the kitchen light"
- "Can you turn on my lights?"

**Brightness variations:**
- "Set brightness to 50%"
- "Dim the lights"
- "Brighten the bedroom"
- "Set to 200 brightness"

**Temperature variations:**
- "Set to 72 degrees"
- "Set the thermostat to 72"
- "I want it to be 68 degrees"
- "Make it warmer"

## Tips & Tricks

1. **Faster Control**: Use exact device names from the device list
2. **Multiple Devices**: The skill handles one device per command
3. **Energy Saving**: Use scenes to control multiple devices at once
4. **Automation**: Combine with Home Assistant automations for scheduling
5. **Privacy**: Keep your API token secure, never share it

## Getting Help

- Check device names: `@agent list all devices`
- Verify connection: Test in AnythingLLM skill settings
- Enable debugging: Check AnythingLLM logs for errors
- Read full docs: See HOME_ASSISTANT_SKILL.md

## Security Reminder
🔒 Your API token is like a password. Never:
- Share it in chat or email
- Commit it to version control
- Post it online
- Leave it in logs

Store it safely in AnythingLLM's settings only.
