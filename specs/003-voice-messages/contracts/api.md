# API Contract: Voice Messages

## 1. Upload Voice Message

**Endpoint**: `POST /api/chats/:chatId/messages/audio`
**Content-Type**: `multipart/form-data`

**Request Body**:
- `audio`: The recorded audio blob file.

**Response**:
```json
{
  "message": {
    "id": "uuid",
    "chatId": "chat-uuid",
    "wamid": "wamid.HBgL...",
    "direction": "OUTBOUND",
    "type": "audio",
    "mediaUrl": "/uploads/audio/12345.webm",
    "status": "SENT",
    "timestamp": "2026-08-21T00:00:00.000Z"
  }
}
```

## 2. Retrieve Media File
**Endpoint**: `GET /uploads/audio/:filename`
**Description**: Static file server endpoint exposed by Express to serve the uploaded audio files to the frontend audio players.
