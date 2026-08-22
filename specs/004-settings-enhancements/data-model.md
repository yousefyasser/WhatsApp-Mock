# Data Model: Settings Enhancements

## Entities

### Chat (Updates)
- `chatNumber` (String): Represents the second party's number.
- `tags` (String[] or related table): Hashtags for triage/filtering.
- `backgroundColor` (String): The custom background color for the chat.
- `webhookUrl` (String): Moved from global settings to per-chat.
- `systemPrompt` (String, if applicable): Moved from global settings to per-chat.
- (Any other previously global settings moved to the Chat model)

## State Transitions
N/A - Mostly CRUD updates.
