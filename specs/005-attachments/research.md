# Research: Media Attachments

**Feature**: 005-attachments
**Date**: 2026-08-26
**Phase**: Phase 0 — Research

---

## 1. WhatsApp Cloud API: Media Upload Endpoint

### Decision
Use `POST /{version}/{phone_number_id}/media` with `multipart/form-data`.

### Key Parameters
- `messaging_product`: must be `"whatsapp"`
- `file`: the binary file
- `type`: MIME type of the file

### Response Structure
```json
{
  "id": "<MEDIA_ID>"
}
```

### Rationale
This is the exact structure defined by the official WhatsApp Cloud API. Since this project is a mirror/mock of WhatsApp, we must follow this to 100% parity.

### Alternatives Considered
- Returning a richer response object — rejected, breaks parity.
- Using JSON body upload — rejected, WhatsApp mandates `multipart/form-data`.

---

## 2. Supported Media Types & File Size Limits

### Decision
Enforce WhatsApp's **exact** file size limits and MIME types. These are strict contract requirements since this is a mirror service.

| Media Type | Supported MIME Types | Max Size |
|:---|:---|:---|
| image | `image/jpeg`, `image/png` | 5 MB |
| video | `video/mp4`, `video/3gp` | 16 MB |
| audio | `audio/aac`, `audio/amr`, `audio/mpeg`, `audio/mp4`, `audio/ogg` (Opus) | 16 MB |
| document | `text/plain`, `application/pdf`, `application/vnd.ms-*`, `application/vnd.openxmlformats-*` | 100 MB |
| sticker | `image/webp` | 100 KB (static), 500 KB (animated) |

### Rationale
Using exact limits ensures that any client application integrated against the real WhatsApp API will behave identically against this mock. Since storage is local (SQLite + filesystem), large files (100 MB documents) are possible but unlikely in development scenarios.

### Alternatives Considered
- Smaller mock limits (e.g., 5 MB max) — rejected because it would break client compatibility testing with document types.
- Configurable limits — considered, but adds complexity without clear benefit for a mock service; WhatsApp limits are the correct defaults.

**Resolution for spec FR-006**: Enforce WhatsApp's exact file size limits. This resolves the `[NEEDS CLARIFICATION]` marker.

---

## 3. Send Media Message — Payload Structure

### Decision
The `POST /{version}/{phone_number_id}/messages` endpoint must be extended to handle media message types. The existing `whatsappCloudApi.ts` only handles `text` and `read` status — we extend it for `image`, `document`, `audio`, `video`, `sticker`.

### Payload Pattern (per type)
```json
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "<PHONE_NUMBER>",
  "type": "image|document|audio|video|sticker",
  "<type>": {
    "id": "<MEDIA_ID>",         // OR
    "link": "<EXTERNAL_URL>",
    "caption": "...",           // image, document, video only
    "filename": "..."           // document only
  }
}
```

### Response Structure
```json
{
  "messaging_product": "whatsapp",
  "contacts": [{ "input": "<to>", "wa_id": "<to>" }],
  "messages": [{ "id": "<wamid>" }]
}
```

### Rationale
Full parity with WhatsApp Cloud API. The mock must accept the same payloads that real integrations send.

### Alternatives Considered
- Accepting only `id` (not `link`) — rejected, WhatsApp supports both and clients use both.

---

## 4. Media Retrieval: Two-Step Download Pattern

### Decision
Follow WhatsApp's exact two-step pattern:
1. `GET /{version}/{media_id}` → returns `{ url, mime_type, sha256, file_size, id }`
2. Client then `GET` the returned `url` with Bearer token to download the file content

The existing `whatsappCloudApi.ts` already implements step 1 partially (for audio only). We extend it to support all media types stored in a new `Media` table.

### Retrieval URL Expiry
Per WhatsApp spec, media URLs are valid for 5 minutes. For the mock, we can simplify by generating stable local URLs (since we control the server) but the field should be present.

### Rationale
Client applications expect this two-step pattern. Implementing a direct `GET /{media_id}` that streams the file content directly would break clients built against the real API.

---

## 5. Media Storage Strategy

### Decision
Store uploaded media files on the **local filesystem** under `backend/uploads/media/<type>/`. Store metadata (id, filename, MIME type, size, path, expiry) in a new **`Media` Prisma model** (SQLite).

### Rationale
- Already used for audio in `backend/uploads/audio/`; extend the pattern consistently.
- No external dependencies needed for a mock service.
- Multer (already installed) handles `multipart/form-data`.

### Alternatives Considered
- Storing files as base64 blobs in SQLite — rejected, degrades performance for large files.
- Using a separate `media` database table within the `Message` model — rejected, media should be decoupled from messages (media can be uploaded independently before sending).

---

## 6. Existing Code Integration Points

| Existing File | Impact |
|:---|:---|
| `backend/src/middleware/upload.ts` | Extend: add `uploadMedia` handler supporting all types and directories |
| `backend/src/routes/whatsappCloudApi.ts` | Extend: add `POST /{phone_number_id}/media` upload + handle media message types in `POST /{phone_number_id}/messages` |
| `backend/prisma/schema.prisma` | Add: `Media` model |
| `frontend/src/components/MessageInput.tsx` | Extend: add file/image attachment picker alongside existing audio recorder |
| `frontend/src/components/MessageBubble.tsx` | Extend: render image, document, video, sticker types |
| `frontend/src/App.tsx` | Extend: add `handleSendMedia` handler |

---

## 7. Webhook Payload for Incoming Media Messages

### Decision
When the mock receives a media message from a user (simulated inbound), the webhook notification sent to the client must include the WhatsApp-format media object:

```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "changes": [{
      "value": {
        "messages": [{
          "id": "<wamid>",
          "type": "image",
          "image": {
            "id": "<media_id>",
            "mime_type": "image/jpeg",
            "sha256": "...",
            "caption": "..."
          }
        }]
      }
    }]
  }]
}
```

### Rationale
Clients that receive webhook events from the real WhatsApp API expect this structure. The mock's `webhookDispatcher.ts` must be extended to produce this format for media messages.
