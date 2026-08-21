# Data Model Updates: WhatsApp Enhancements

## 1. Schema Changes (Prisma)

### Modified Entities

**`Setting` Model**:
- **Removed**: `webhookUrl` (String)
- **Removed**: `webhookVerifyToken` (String) - *Assuming this is also chat specific or deprecated. We'll leave verify token in global if it's for the overall app, but usually it pairs with webhookUrl. For now, we'll remove it from global or keep it.* Let's remove `accessToken` and `webhookUrl` from `Setting` as per requirements.

**`Chat` Model**:
- **Added**: `accessToken` (String, required or default)
- **Added**: `webhookUrl` (String, required or default)

### 2. State Transitions
- No new state transitions. The `Message` model already has a `status` field (`"SENT"`, `"DELIVERED"`, `"READ"`, `"FAILED"`). We will just utilize this existing field in the UI.

## 3. Validation Rules
- When creating a new chat, the frontend must provide `webhookUrl` and `accessToken`.
- The `webhookDispatcher` must now query the `Chat` object to get the webhook URL and access token instead of querying the global `Setting` object.
