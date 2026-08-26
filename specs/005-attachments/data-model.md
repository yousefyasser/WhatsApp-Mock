# Data Model: Media Attachments

**Feature**: 005-attachments
**Date**: 2026-08-26
**Phase**: Phase 1 — Design

---

## Entities

### 1. Media

Represents a file uploaded to the service via the WhatsApp Cloud API media upload endpoint.

| Field | Type | Description |
|:---|:---|:---|
| `id` | `String` (UUID) | Unique media identifier. This is what clients store and reference as the `MEDIA_ID`. |
| `filename` | `String` | Original filename from the upload. |
| `mimeType` | `String` | MIME type of the file (e.g., `image/jpeg`, `application/pdf`). |
| `fileSize` | `Int` | File size in bytes. |
| `mediaType` | `String` | Enum-style category: `image`, `audio`, `video`, `document`, `sticker`. |
| `storagePath` | `String` | Relative path to the file on the local filesystem (e.g., `uploads/media/image/abc-123.jpg`). |
| `sha256` | `String` | SHA-256 hash of the file content. Returned in `GET /{media_id}` response per WhatsApp spec. |
| `uploadedAt` | `DateTime` | Timestamp of upload. Used to calculate expiry. |
| `expiresAt` | `DateTime` | Expiry timestamp. Uploaded media expires in **30 days**; incoming webhook media in **7 days**. |

**Validation Rules**:
- `mimeType` must match one of the supported WhatsApp MIME types for the declared `mediaType`.
- `fileSize` must not exceed the per-type limit (image: 5 MB, audio/video: 16 MB, document: 100 MB, sticker: 100/500 KB).
- `id` is system-generated (UUID) — never client-supplied.

---

### 2. Message (Media Fields Extension)

The existing `Message` model is extended with richer media fields to support all media types properly.

**New / Extended Fields on Message**:

| Field | Type | Description |
|:---|:---|:---|
| `mediaId` | `String?` | FK to `Media.id` — present when media was uploaded via the mock. |
| `mediaLink` | `String?` | External URL — present when client sent `link` instead of `id`. |
| `mediaCaption` | `String?` | Caption text. Supported for `image`, `document`, `video`. |
| `mediaFilename` | `String?` | Document filename hint shown to the recipient. Only for `document` type. |

**Existing Fields Retained**:
- `type` (String): already stores `text`, `audio`; now also `image`, `document`, `video`, `sticker`.
- `mediaUrl` (String?): updated to reflect the served URL path for locally uploaded media.

---

## Relationships

```
Media (1) ──────────────── (0..*) Message
       (via Message.mediaId)
```

- A `Media` record can be referenced by multiple `Message` records (same file sent to multiple recipients or in multiple messages).
- A `Message` of a media type either references a `Media` record (via `mediaId`) or an external `link` — never both.

---

## State Transitions: Media Lifecycle

```
[Upload] → stored (active)
         → [30 days pass] → expired (soft delete, file retained for lookup)
         → [manual cleanup] → deleted
```

For incoming webhook-sourced media (simulated inbound):
```
[Inbound message created] → mediaId set, expiresAt = now + 7 days
                          → [7 days pass] → expired
```

---

## Prisma Schema Addition

```prisma
model Media {
  id          String   @id @default(uuid())
  filename    String
  mimeType    String
  fileSize    Int
  mediaType   String   // "image" | "audio" | "video" | "document" | "sticker"
  storagePath String
  sha256      String   @default("")
  uploadedAt  DateTime @default(now())
  expiresAt   DateTime
  messages    Message[]
}
```

**Extension to existing `Message` model**:
```prisma
// Add to existing Message model:
  mediaId       String?
  media         Media?   @relation(fields: [mediaId], references: [id])
  mediaLink     String?
  mediaCaption  String?
  mediaFilename String?
```
