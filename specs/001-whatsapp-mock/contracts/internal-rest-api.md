# Contract: Internal Backend REST & Socket API

This contract defines the internal endpoints exposed by the Node.js backend to serve the React JS UI.

---

## 1. Settings Endpoints

### `GET /api/settings`
Get current WhatsApp Mock instance settings.

- **Response (200 OK)**:
  ```json
  {
    "id": "default",
    "phoneNumber": "15550001111",
    "displayName": "WhatsApp Business Mock",
    "phoneNumberId": "100000000000001",
    "wabaId": "200000000000002",
    "accessToken": "mock_access_token_secret",
    "webhookUrl": "http://localhost:8000/api/whatsapp/webhook",
    "webhookVerifyToken": "mock_verify_token",
    "updatedAt": "2026-08-21T00:00:00.000Z"
  }
  ```

### `PUT /api/settings`
Update WhatsApp Mock instance settings.

- **Request Body**: Partial or full `Setting` object.
- **Response (200 OK)**: Updated `Setting` object.

---

## 2. Chat & Contact Endpoints

### `GET /api/chats`
List all active chats sorted by `lastMessageAt` descending.

- **Response (200 OK)**:
  ```json
  [
    {
      "id": "chat-uuid-1",
      "contactId": "contact-uuid-1",
      "contact": {
        "id": "contact-uuid-1",
        "phoneNumber": "1234567890",
        "name": "Customer Support Test"
      },
      "lastMessageAt": "2026-08-21T00:15:00.000Z",
      "unreadCount": 0,
      "lastMessage": {
        "id": "msg-uuid-1",
        "textBody": "Hello!",
        "direction": "INBOUND",
        "timestamp": "2026-08-21T00:15:00.000Z"
      }
    }
  ]
  ```

### `POST /api/chats`
Create a new chat/contact.

- **Request Body**:
  ```json
  {
    "phoneNumber": "1234567890",
    "name": "John Doe"
  }
  ```
- **Response (201 Created)**: Created `Chat` object.

---

## 3. Message Endpoints

### `GET /api/chats/:chatId/messages`
Get message transcript for a given chat.

- **Response (200 OK)**: Array of `Message` objects sorted by `timestamp` ascending.

### `POST /api/chats/:chatId/messages`
Send a text message from the UI (triggers outbound Webhook dispatch).

- **Request Body**:
  ```json
  {
    "text": "Hello from WhatsApp Mock UI!"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "message": {
      "id": "msg-uuid-2",
      "chatId": "chat-uuid-1",
      "wamid": "wamid.HBgL...",
      "direction": "OUTBOUND",
      "senderPhone": "15550001111",
      "recipientPhone": "1234567890",
      "textBody": "Hello from WhatsApp Mock UI!",
      "status": "SENT",
      "timestamp": "2026-08-21T00:20:00.000Z"
    },
    "webhookDelivery": {
      "success": true,
      "statusCode": 200
    }
  }
  ```

---

## 4. Webhook Logs Endpoint

### `GET /api/webhook-logs`
Get recent webhook log entries for delivery verification & debugging.

- **Response (200 OK)**: Array of `WebhookLog` objects.
