# Tasks: Voice Messages

**Input**: Design documents from `/specs/003-voice-messages/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Install backend dependencies for file uploads (e.g., `npm install multer`) in `backend/`
- [x] T002 Install frontend dependencies for lucide icons if any new ones are needed (mic, pause, play) in `frontend/`
- [x] T003 Create `backend/uploads/audio` directory to store audio files

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Update `Message` model in `backend/prisma/schema.prisma` to include `type` and `mediaUrl` fields, and make `textBody` optional. Run Prisma db push.
- [x] T005 Update `frontend/src/types/index.ts` to reflect the new `type` and `mediaUrl` fields on the `Message` interface.
- [x] T006 Configure Express in `backend/src/index.ts` to serve static files from the `uploads/audio/` directory under `/uploads/audio`.

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Voice Recording UI (Priority: P1) 🎯 MVP

**Goal**: Users can record voice messages and preview them in the UI before sending.

**Independent Test**: The user can press a microphone button, record audio, stop, and play back the audio blob in the browser.

### Implementation for User Story 1

- [x] T007 [P] [US1] Create a new `frontend/src/components/AudioRecorder.tsx` component that uses the `MediaRecorder` API to record audio and returns an audio Blob on stop.
- [x] T008 [US1] Update `frontend/src/components/MessageInput.tsx` to integrate `AudioRecorder.tsx`. Hide text input when recording, show an audio preview (using `<audio>`) when a recording is finished.
- [x] T009 [US1] Add a mechanism in `MessageInput.tsx` to discard the previewed audio.

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently (recording UI works, but doesn't send yet).

---

## Phase 4: User Story 2 - Backend Audio API (Priority: P2)

**Goal**: The backend can receive audio file uploads, save them to disk, and store the metadata in the database.

**Independent Test**: Can send a POST request with an audio file to the backend, and receive a successful response with the saved file URL and database record.

### Implementation for User Story 2

- [x] T010 [US2] Implement Multer configuration in `backend/src/middleware/upload.ts` to handle audio uploads and save to `uploads/audio/`.
- [x] T011 [US2] Implement POST `/chats/:chatId/messages/audio` route in `backend/src/routes/messages.ts` using the Multer middleware to process the upload, create a new `Message` record with `type="audio"` and `mediaUrl`, and emit the socket event.

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently (backend can handle uploads via Curl/Postman).

---

## Phase 5: User Story 3 - Send and Playback Integration (Priority: P3)

**Goal**: Frontend sends recorded audio to backend, and message history renders an audio player.

**Independent Test**: A user records a message, hits send, and it appears in the chat history as an audio player that can be played by anyone.

### Implementation for User Story 3

- [x] T012 [P] [US3] Implement `api.postForm` or update `frontend/src/services/api.ts` to support `multipart/form-data` uploads.
- [x] T013 [US3] Update `frontend/src/App.tsx` and `ChatWindow.tsx` to add `handleSendAudio` which posts the audio blob to the new backend route.
- [x] T014 [US3] Update `MessageInput.tsx` to trigger `onSendAudio` when the send button is clicked with a recorded audio blob.
- [x] T015 [US3] Update `frontend/src/components/MessageBubble.tsx` to conditionally render an HTML `<audio controls src={message.mediaUrl} />` element if `message.type === 'audio'`.

**Checkpoint**: All user stories should now be independently functional. The end-to-end flow described in `quickstart.md` works.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T016 [P] Verify that the frontend UI does not break when older messages missing the `type` field are rendered (fallback to `text`).
- [x] T017 Verify full build runs successfully (`cd frontend && npm run build`).
- [x] T018 Run `quickstart.md` validation.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independently testable API
- **User Story 3 (P3)**: Depends on US1 (needs audio blob) and US2 (needs API endpoint)

### Within Each User Story

- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, User Story 1 and User Story 2 can start in parallel.
- US3 must wait for US1 and US2.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently (ensure microphone recording works in the browser).

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently (Record and Preview UI works)
3. Add User Story 2 → Test independently (Backend can accept audio files)
4. Add User Story 3 → Test independently (End-to-End recording, sending, and playback works)
