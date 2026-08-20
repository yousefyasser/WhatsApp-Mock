# Contract: Meta WhatsApp Cloud API Endpoint Mocks

**Version**: `v22.0`  
**Base Path**: `/v22.0`

This contract details the Meta WhatsApp Cloud API endpoints implemented by the backend server for integrated client services to test sending messages and setting status.

---

## 1. Send Text Message

Send a text message from a client service into the WhatsApp Mock instance.

- **Method**: `POST`
- **Path**: `/v22.0/:phone_number_id/messages`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>` (Optional/Validated against Settings `accessToken` if configured)

### Request Payload (Text Message)
```json
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "1234567890",
  "type": "text",
  "text": {
    "preview_url": false,
    "body": "Hello, world!"
  }
}
```

### Success Response (200 OK)
```json
{
  "messaging_product": "whatsapp",
  "contacts": [
    {
      "input": "1234567890",
      "wa_id": "1234567890"
    }
  ],
  "messages": [
    {
      "id": "wamid.HBgLMjAxMjM0NTY3ODkwFQIAERgSQUU1REI4ODRBRTRFNEMyODg0AA=="
    }
  ]
}
```

### Error Response (400 Bad Request)
```json
{
  "error": {
    "message": "(#100) Param recipient_type must be individual or text body missing",
    "type": "OAuthException",
    "code": 100,
    "fbtrace_id": "MockTraceId12345"
  }
}
```

---

## 2. Mark Message as Read

Mark a previously received message as read by the client service.

- **Method**: `POST`
- **Path**: `/v22.0/:phone_number_id/messages`

### Request Payload
```json
{
  "messaging_product": "whatsapp",
  "status": "read",
  "message_id": "wamid.HBgLMjAxMjM0NTY3ODkwFQIAERgSQUU1REI4ODRBRTRFNEMyODg0AA=="
}
```

### Success Response (200 OK)
```json
{
  "success": true
}
```
