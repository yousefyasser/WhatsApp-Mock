# Internal REST API Contracts Updates

## 1. Create Chat Endpoint Update
**POST /api/chats**

**Request Body**:
```json
{
  "phoneNumber": "string",
  "name": "string (optional)",
  "webhookUrl": "string (required)",
  "accessToken": "string (required)"
}
```

## 2. Global Settings Endpoint Update
**GET /api/settings** and **PUT /api/settings**
- `webhookUrl` and `accessToken` are removed from the response and request payload.

## 3. Webhook Dispatch Payload
- The webhook dispatch mechanism remains the same, but it uses the chat-level configuration. The payload sent to the webhook is unchanged.
