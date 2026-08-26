# Tasks: Media Attachments

**Input**: Design documents from `specs/005-attachments/`

**Prerequisites**: [plan.md](./plan.md) ✅ | [spec.md](./spec.md) ✅ | [research.md](./research.md) ✅ | [data-model.md](./data-model.md) ✅ | [contracts/api.md](./contracts/api.md) ✅

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- All paths are relative to the repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Extend existing infrastructure to support all media types.

- [X] T001 Create upload directories for all media types in `backend/uploads/media/image/`, `backend/uploads/media/audio/`, `backend/uploads/media/video/`, `backend/uploads/media/document/`, `backend/uploads/media/sticker/`
- [X] T002 Add `Media` model and `Message` media field extensions to `backend/prisma/schema.prisma` per `data-model.md`
- [X] T003 Generate and apply Prisma migration: `cd backend && npx prisma migrate dev --name add-media-attachments`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core backend infrastructure shared by all three user stories.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T004 Create `backend/src/services/mediaService.ts` with MIME type validation map, per-type size limit map (image 5 MB, audio/video 16 MB, document 100 MB, sticker 100/500 KB), SHA-256 hash utility, and CRUD methods: `createMedia`, `getMediaById`, `buildDownloadUrl`
- [X] T005 [P] Extend `backend/src/middleware/upload.ts` to export `uploadMedia` — a Multer instance with `diskStorage` routing files to `backend/uploads/media/<mediaType>/` and enforcing per-type file size limits via `limits.fileSize`
- [X] T006 [P] Extend `frontend/src/types/index.ts` to add `mediaId`, `mediaLink`, `mediaCaption`, `mediaFilename` fields to the `Message` type, and add a `Media` type mirroring the backend model

**Checkpoint**: Database migrated, `mediaService.ts` and `uploadMedia` middleware ready — user stories can now begin.

---

## Phase 3: User Story 1 — Upload Media (Priority: P1) 🎯 MVP

**Goal**: API clients can upload files and receive a WhatsApp-compliant media ID.

**Independent Test**: `curl -X POST http://localhost:3000/v22.0/100000000000001/media -F "messaging_product=whatsapp" -F "type=image/jpeg" -F "file=@test.jpg"` returns `{ "id": "<uuid>" }`.

### Implementation

- [X] T007 [US1] Add `POST /:phone_number_id/media` route to `backend/src/routes/whatsappCloudApi.ts` that: (1) uses `uploadMedia` middleware, (2) validates `messaging_product === "whatsapp"`, (3) calls `mediaService.createMedia` to persist metadata, (4) returns `{ "id": "<media_id>" }` per [contracts/api.md](./contracts/api.md)
- [X] T008 [US1] Add MIME type validation inside `mediaService.createMedia` — reject unsupported types with WhatsApp-format `{ "error": { "message": "...", "type": "OAuthException", "code": 100 } }` error
- [X] T009 [US1] Add file size validation — reject files exceeding per-type limits with the same WhatsApp error format
- [X] T010 [P] [US1] Create `frontend/src/services/mediaApi.ts` with `uploadMedia(file: File, phoneNumberId: string): Promise<{ id: string }>` function using `multipart/form-data`
- [X] T011 [P] [US1] Create `frontend/src/components/MediaPreview.tsx` — shows thumbnail for images, filename+icon for documents/audio/video/sticker, with a discard (×) button

**Checkpoint**: US1 fully functional. `POST /v22.0/{phone_number_id}/media` returns a valid media ID.

---

## Phase 4: User Story 2 — Send Media Message (Priority: P1)

**Goal**: API clients can send messages of type `image`, `document`, `audio`, `video`, or `sticker` using a media ID or external link.

**Independent Test**: After uploading a file (US1), `curl -X POST http://localhost:3000/v22.0/100000000000001/messages -H "Content-Type: application/json" -d '{"messaging_product":"whatsapp","to":"15551234567","type":"image","image":{"id":"<MEDIA_ID>"}}'` returns `{ "messaging_product": "whatsapp", "messages": [{ "id": "wamid...." }] }`.

### Implementation

- [X] T012 [US2] Extend `POST /:phone_number_id/messages` in `backend/src/routes/whatsappCloudApi.ts` to handle media message types (`image`, `document`, `audio`, `video`, `sticker`) in addition to the existing `text` handler — validate media ID exists (via `mediaService.getMediaById`) or accept `link` field; persist message to DB with `type`, `mediaId`/`mediaLink`, `mediaCaption`, `mediaFilename`; return WhatsApp-standard response
- [X] T013 [US2] Extend `backend/src/services/chatService.ts` — update `handleIncomingApiMessage` to accept media message payloads so simulated inbound media messages can be processed and stored
- [X] T014 [US2] Extend `backend/src/services/webhookDispatcher.ts` to include a typed media object (`image`, `document`, `audio`, `video`, `sticker`) in the webhook notification payload for media messages, per [contracts/api.md § Inbound Media Webhook](./contracts/api.md)
- [X] T015 [P] [US2] Extend `frontend/src/components/MessageInput.tsx` to add a paperclip attachment icon button (alongside existing mic) — clicking opens a file picker filtered to `image/jpeg,image/png,video/mp4,audio/mpeg,audio/mp4,application/pdf,image/webp`; on file selection renders `MediaPreview`; on send calls `mediaApi.uploadMedia` then `api.post(messages)` with the returned media ID
- [X] T016 [P] [US2] Extend `frontend/src/components/MessageBubble.tsx` to render media message types: `image` → `<img>` tag with `src` from `mediaUrl`; `document` → filename link with download icon; `video` → `<video controls>`; `sticker` → `<img>` (transparent background); `audio` continues to use `<audio controls>` (existing, verify it works with new `mediaId` path)
- [X] T017 [US2] Extend `frontend/src/App.tsx` to add `handleSendMedia(file: File)` — calls `mediaApi.uploadMedia`, then posts a media message; wire it to `ChatWindow` and `MessageInput`

**Checkpoint**: US2 fully functional. Media messages can be sent via API and rendered in the UI.

---

## Phase 5: User Story 3 — Download Media (Priority: P2)

**Goal**: API clients can use the WhatsApp two-step pattern to retrieve and download media by its ID.

**Independent Test**: `curl http://localhost:3000/v22.0/<MEDIA_ID>` returns `{ "url": "...", "mime_type": "...", "sha256": "...", "file_size": N, "id": "..." }`; then `curl -H "Authorization: Bearer mock_access_token_secret" <url>` downloads the raw file.

### Implementation

- [X] T018 [US3] Rewrite `GET /:media_id` handler in `backend/src/routes/whatsappCloudApi.ts` to look up the `Media` table (not `Message`) via `mediaService.getMediaById`, and return the full WhatsApp-format response: `{ url, mime_type, sha256, file_size, id }` — replace the existing audio-only stub
- [X] T019 [US3] Add `GET /media/:media_id/download` route to `backend/src/routes/whatsappCloudApi.ts` — validates `Authorization: Bearer` token against the media's associated chat `accessToken` (or a global mock token), then streams the file from `storagePath` with correct `Content-Type` header
- [X] T020 [P] [US3] Add `Authorization` header to `frontend/src/services/mediaApi.ts` download function: `downloadMedia(mediaId: string): Promise<Blob>` — fetches `GET /v22.0/{mediaId}` to get `url`, then fetches `url` with Bearer token to stream the file

**Checkpoint**: US3 fully functional. Full two-step download pattern works end-to-end.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finalize the feature with regression checks and documentation.

- [X] T021 [P] Add static file serving for `backend/uploads/media/` in `backend/src/index.ts` (extend existing `/uploads` route or add `/uploads/media`)
- [X] T022 [P] Update `backend/src/routes/chats.ts` internal audio upload route (`POST /:chatId/messages/audio`) to use the new `uploadMedia` middleware and `mediaService` instead of the old `uploadAudio` — this eliminates the legacy audio-only path and unifies all media through the WhatsApp API contract
- [X] T023 Run the [quickstart.md](./quickstart.md) validation scenarios manually end-to-end and confirm all pass
- [X] T024 [P] Update `README.md` at repository root with the new media endpoints and usage examples

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (DB migration must complete first)
- **US1 (Phase 3)**: Depends on Phase 2 — specifically `mediaService.ts` and `uploadMedia`
- **US2 (Phase 4)**: Depends on Phase 2 (DB/service) and Phase 3 (`mediaService.getMediaById` needed for ID validation)
- **US3 (Phase 5)**: Depends on Phase 2 (`mediaService.getMediaById`) — can be worked on independently of US2
- **Polish (Phase 6)**: Depends on US1 + US2 + US3

### User Story Dependencies

- **US1 (Upload)**: Can start after Foundational
- **US2 (Send)**: Depends on US1 completing `mediaService.getMediaById` (T004) — otherwise independent
- **US3 (Download)**: Can start after Foundational — independent of US2

### Within Each User Story

- Backend service → Backend route → Frontend service → Frontend UI component
- Backend and frontend tasks marked [P] within the same story can be parallelized

### Parallel Opportunities

```
# Phase 1 — sequential (migration dependency)
T001 → T002 → T003

# Phase 2 — T005 and T006 can run in parallel after T004 starts
T004 (mediaService) → T005 [P] (uploadMedia), T006 [P] (frontend types)

# Phase 3 (US1) — T010 and T011 can run in parallel with T007-T009
T007 → T008 → T009 (backend, sequential)
T010 [P], T011 [P] (frontend, parallel with backend)

# Phase 4 (US2) — backend sequential, frontend parallel
T012 → T013 → T014 (backend)
T015 [P], T016 [P] (frontend, parallel with backend after T012)
T017 (after T015/T016)

# Phase 5 (US3)
T018 → T019 (backend, sequential)
T020 [P] (frontend, parallel with T018-T019)

# Phase 6 — T021 and T024 parallel
T021 [P], T022 [P], T024 [P] (parallel)
T023 (after T021, T022 — requires running service)
```

---

## Implementation Strategy

### MVP Scope (US1 + US2 Backend Only — ~6 tasks)

1. Complete Phase 1 (Setup) — T001–T003
2. Complete Phase 2 (Foundation) — T004–T005
3. Complete US1 backend — T007–T009
4. Complete US2 backend — T012–T014
5. **Validate**: Use `quickstart.md` Scenarios 1–4 with `curl`
6. **Stop and demo** — API is fully compliant, frontend follows

### Incremental Delivery

1. Phase 1+2 → Foundation ready
2. Phase 3 (US1) → Media upload via API ✅
3. Phase 4 (US2) → Send media messages via API + UI ✅
4. Phase 5 (US3) → Full download support ✅
5. Phase 6 → Polish ✅

---

## Notes

- [P] tasks = different files, no shared state, safe to parallelize
- All error responses must use the WhatsApp `{ "error": { "message", "type", "code" } }` format
- Existing text message and audio routes must not be broken (validate with quickstart.md Frontend section)
- Commit after each checkpoint to preserve independently working increments
