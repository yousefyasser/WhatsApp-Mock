# Quickstart Validation Guide: Media Attachments

**Feature**: 005-attachments
**Date**: 2026-08-26

Use this guide to validate that the media attachments feature works end-to-end after implementation. Each scenario maps to a user story from [spec.md](./spec.md).

---

## Prerequisites

- Docker Compose running: `docker-compose up -d`
- Backend available at `http://localhost:3000`
- Frontend available at `http://localhost:5173`
- A test chat exists (create one via the UI or API first)
- A test image file available locally (e.g., `test.jpg`, JPEG, < 5 MB)
- A test PDF file available locally (e.g., `test.pdf`, < 100 MB)

---

## Scenario 1: Upload Media (US1 — P1)

**Goal**: Upload an image file and receive a media ID.

### Step 1: Upload an image

```bash
curl -X POST "http://localhost:3000/v22.0/100000000000001/media" \
  -F "messaging_product=whatsapp" \
  -F "type=image/jpeg" \
  -F "file=@test.jpg"
```

**Expected Response (200)**:
```json
{
  "id": "<some-uuid>"
}
```

✅ **Pass if**: Response is 200 with a non-empty `id` field (UUID format).

### Step 2: Upload unsupported file type

```bash
curl -X POST "http://localhost:3000/v22.0/100000000000001/media" \
  -F "messaging_product=whatsapp" \
  -F "type=image/bmp" \
  -F "file=@test.bmp"
```

**Expected Response (400)**:
```json
{
  "error": {
    "message": "Unsupported media type: image/bmp",
    ...
  }
}
```

✅ **Pass if**: Response is 400 with an `error.message` describing the unsupported type.

---

## Scenario 2: Send Media Message (US2 — P1)

**Goal**: Send an image message using the uploaded media ID.

### Step 1: Upload the image (if not done in Scenario 1)

Use the command from Scenario 1. Copy the returned `id` as `<MEDIA_ID>`.

### Step 2: Send the image message

```bash
curl -X POST "http://localhost:3000/v22.0/100000000000001/messages" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": "<RECIPIENT_PHONE>",
    "type": "image",
    "image": {
      "id": "<MEDIA_ID>",
      "caption": "Hello from the mock!"
    }
  }'
```

**Expected Response (200)**:
```json
{
  "messaging_product": "whatsapp",
  "contacts": [{ "input": "<RECIPIENT_PHONE>", "wa_id": "<RECIPIENT_PHONE>" }],
  "messages": [{ "id": "wamid...." }]
}
```

✅ **Pass if**: Response is 200 with `messaging_product: "whatsapp"` and a `messages[0].id` starting with `wamid.`.

### Step 3: Verify in the UI

1. Open `http://localhost:5173` in a browser.
2. Navigate to the chat for `<RECIPIENT_PHONE>`.
3. The image should appear as a message bubble with the image rendered.

✅ **Pass if**: The image is displayed inline in the chat window.

### Step 4: Send with invalid media ID

```bash
curl -X POST "http://localhost:3000/v22.0/100000000000001/messages" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": "<RECIPIENT_PHONE>",
    "type": "image",
    "image": { "id": "00000000-0000-0000-0000-000000000000" }
  }'
```

**Expected Response (400)**:
```json
{
  "error": { "message": "Media ID not found or expired", ... }
}
```

✅ **Pass if**: Response is 400 with a clear error message.

### Step 5: Send via link

```bash
curl -X POST "http://localhost:3000/v22.0/100000000000001/messages" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": "<RECIPIENT_PHONE>",
    "type": "image",
    "image": { "link": "https://picsum.photos/400/300" }
  }'
```

✅ **Pass if**: Response is 200 and the chat shows the image loaded from the external URL.

---

## Scenario 3: Download Media (US2 — P2)

**Goal**: Use the two-step WhatsApp download pattern to retrieve a media file.

### Step 1: Get the media URL

Using the `<MEDIA_ID>` from Scenario 1:

```bash
curl "http://localhost:3000/v22.0/<MEDIA_ID>"
```

**Expected Response (200)**:
```json
{
  "url": "http://localhost:3000/v22.0/media/<MEDIA_ID>/download",
  "mime_type": "image/jpeg",
  "sha256": "...",
  "file_size": 204800,
  "id": "<MEDIA_ID>"
}
```

✅ **Pass if**: Response contains `url`, `mime_type`, `sha256`, `file_size`, and `id`.

### Step 2: Download the file

```bash
curl -H "Authorization: Bearer mock_access_token_secret" \
  "http://localhost:3000/v22.0/media/<MEDIA_ID>/download" \
  --output downloaded_photo.jpg
```

✅ **Pass if**: A valid image file is saved to `downloaded_photo.jpg` and can be opened.

---

## Scenario 4: Document Message (US2 variant)

**Goal**: Send a PDF document with filename and caption.

### Step 1: Upload the PDF

```bash
curl -X POST "http://localhost:3000/v22.0/100000000000001/media" \
  -F "messaging_product=whatsapp" \
  -F "type=application/pdf" \
  -F "file=@test.pdf"
```

Copy the returned `id` as `<DOC_ID>`.

### Step 2: Send the document

```bash
curl -X POST "http://localhost:3000/v22.0/100000000000001/messages" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": "<RECIPIENT_PHONE>",
    "type": "document",
    "document": {
      "id": "<DOC_ID>",
      "caption": "Q3 Invoice",
      "filename": "invoice_q3.pdf"
    }
  }'
```

✅ **Pass if**: Response is 200 and the chat window shows a document bubble displaying `invoice_q3.pdf` with a download/preview affordance.

---

## Frontend Validation

Open `http://localhost:5173` and verify:

- [ ] A paperclip/attachment icon appears in the message input area (next to the mic icon).
- [ ] Clicking the icon opens a file picker that accepts `image/jpeg`, `image/png`, `video/mp4`, `application/pdf`, `image/webp`.
- [ ] Selecting a file shows a preview before sending (image thumbnail or filename for documents).
- [ ] After sending, the message bubble renders the correct media type.
- [ ] Audio messages continue to work as before (regression check).
