# API Contracts: Media Attachments

**Feature**: 005-attachments
**Version**: v22.0 (matches current mock server API version)
**Date**: 2026-08-26

All endpoints follow the WhatsApp Cloud API specification. Base URL: `http://localhost:3000`

---

## 1. Upload Media

**`POST /v22.0/{phone_number_id}/media`**

Upload a media file and receive a media ID.

### Request

```
Content-Type: multipart/form-data
```

| Field | Type | Required | Description |
|:---|:---|:---|:---|
| `messaging_product` | string | ✅ | Must be `"whatsapp"` |
| `file` | binary | ✅ | The media file content |
| `type` | string | ✅ | MIME type of the file (e.g., `image/jpeg`) |

**Example (`curl`)**:
```bash
curl -X POST "http://localhost:3000/v22.0/100000000000001/media" \
  -F "messaging_product=whatsapp" \
  -F "type=image/jpeg" \
  -F "file=@/path/to/photo.jpg"
```

### Responses

**200 OK — Success**:
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

**400 Bad Request — Invalid MIME type**:
```json
{
  "error": {
    "message": "Unsupported media type: image/bmp",
    "type": "OAuthException",
    "code": 100
  }
}
```

**400 Bad Request — File too large**:
```json
{
  "error": {
    "message": "File size exceeds the maximum allowed size for image (5 MB)",
    "type": "OAuthException",
    "code": 100
  }
}
```

**400 Bad Request — Missing fields**:
```json
{
  "error": {
    "message": "messaging_product must be 'whatsapp'",
    "type": "OAuthException",
    "code": 100
  }
}
```

---

## 2. Get Media URL

**`GET /v22.0/{media_id}`**

Retrieve the download URL and metadata for a media file by its ID.

### Request

No body required.

**Example (`curl`)**:
```bash
curl "http://localhost:3000/v22.0/a1b2c3d4-e5f6-7890-abcd-ef1234567890"
```

### Responses

**200 OK — Success**:
```json
{
  "url": "http://localhost:3000/v22.0/media/a1b2c3d4-e5f6-7890-abcd-ef1234567890/download",
  "mime_type": "image/jpeg",
  "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "file_size": 204800,
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

**404 Not Found**:
```json
{
  "error": {
    "message": "No media with id a1b2c3d4",
    "type": "OAuthException",
    "code": 100
  }
}
```

---

## 3. Download Media Content

**`GET /v22.0/media/{media_id}/download`**

Download the raw binary content of a media file.

### Request

No body required. Requires `Authorization: Bearer <token>` header (uses existing mock token from `Chat.accessToken`).

**Example (`curl`)**:
```bash
curl -H "Authorization: Bearer mock_access_token_secret" \
  "http://localhost:3000/v22.0/media/a1b2c3d4-e5f6-7890-abcd-ef1234567890/download" \
  --output photo.jpg
```

### Responses

**200 OK**: Raw binary file content with appropriate `Content-Type` header.

**401 Unauthorized**:
```json
{
  "error": {
    "message": "Invalid OAuth access token",
    "type": "OAuthException",
    "code": 190
  }
}
```

**404 Not Found**: Same structure as above.

---

## 4. Send Media Message

**`POST /v22.0/{phone_number_id}/messages`**

Send a message containing a media attachment. Extends the existing text message endpoint.

### Request

```
Content-Type: application/json
```

**Image Message** (by ID):
```json
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "15551234567",
  "type": "image",
  "image": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "caption": "Optional caption text"
  }
}
```

**Image Message** (by link):
```json
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "15551234567",
  "type": "image",
  "image": {
    "link": "https://example.com/photo.jpg",
    "caption": "Optional caption"
  }
}
```

**Document Message**:
```json
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "15551234567",
  "type": "document",
  "document": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "caption": "Invoice for Q3",
    "filename": "invoice_q3.pdf"
  }
}
```

**Audio Message**:
```json
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "15551234567",
  "type": "audio",
  "audio": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  }
}
```

**Video Message**:
```json
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "15551234567",
  "type": "video",
  "video": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "caption": "Watch this!"
  }
}
```

**Sticker Message**:
```json
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "15551234567",
  "type": "sticker",
  "sticker": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  }
}
```

### Responses

**200 OK — Success**:
```json
{
  "messaging_product": "whatsapp",
  "contacts": [{ "input": "15551234567", "wa_id": "15551234567" }],
  "messages": [{ "id": "wamid.HBgLMTU1NTEyMzQ1NjcVAgARGBI..." }]
}
```

**400 Bad Request — Invalid media ID**:
```json
{
  "error": {
    "message": "Media ID not found or expired",
    "type": "OAuthException",
    "code": 131051
  }
}
```

**400 Bad Request — Unsupported type**:
```json
{
  "error": {
    "message": "Unsupported message type",
    "type": "OAuthException",
    "code": 100
  }
}
```

---

## 5. Inbound Media Webhook Notification

When a simulated inbound media message arrives, the mock dispatches this webhook payload to the configured webhook URL.

```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "id": "200000000000002",
    "changes": [{
      "value": {
        "messaging_product": "whatsapp",
        "metadata": {
          "display_phone_number": "15550001111",
          "phone_number_id": "100000000000001"
        },
        "messages": [{
          "id": "wamid.HBgL...",
          "from": "15559876543",
          "timestamp": "1724700000",
          "type": "image",
          "image": {
            "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
            "mime_type": "image/jpeg",
            "sha256": "e3b0c44298fc1c149afbf4c8996fb92...",
            "caption": "Check this out!"
          }
        }]
      },
      "field": "messages"
    }]
  }]
}
```

> **Note**: For non-image types, replace the `"image"` key and object with `"document"`, `"audio"`, `"video"`, or `"sticker"` with their respective fields as defined in sections 1–4 above.
