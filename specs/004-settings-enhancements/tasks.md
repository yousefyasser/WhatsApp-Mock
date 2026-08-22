# Implementation Tasks: Settings Enhancements

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project configuration updates.

- [x] T001 Update `docker-compose.yml` backend service to include `extra_hosts: ["host.docker.internal:host-gateway"]` to enable localhost webhook access.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Update the database schema to reflect the new per-chat settings architecture and UI enhancements.

- [x] T002 Update `backend/prisma/schema.prisma`: Remove the `Setting` model entirely.
- [x] T003 Update `backend/prisma/schema.prisma`: Add fields to `Chat` model (`phoneNumber`, `displayName`, `phoneNumberId`, `wabaId`, `webhookVerifyToken`) with appropriate defaults.
- [x] T004 Update `backend/prisma/schema.prisma`: Add `tags` (String, default empty JSON array or simple text) and `backgroundColor` (String, default empty) to the `Chat` model.
- [x] T005 Run Prisma migrations (`npx prisma migrate dev --name chat_settings_enhancements` inside `backend`).
- [x] T006 Update Prisma client generated types in frontend/backend.

**Checkpoint**: Database schema supports all required data for the new features.

---

## Phase 3: User Story 1 - Settings Architecture Revamp (Priority: P1) 🎯 MVP

**Goal**: Move all settings from global context to per-chat context, update the UI to collect all settings on creation/edit, and add info hints.

**Independent Test**: Create a new chat and verify all settings (WABA ID, verify token, etc.) are prompted. Edit an existing chat and verify all settings can be modified.

### Implementation for User Story 1

- [x] T007 [P] [US1] Update `backend/src/api/settings.ts` (if exists) and `backend/src/api/chats.ts` to read/write settings from the `Chat` model instead of `Setting` model.
- [x] T008 [P] [US1] Update `backend/src/services/whatsapp.ts` (or relevant webhook logic) to use the per-chat `webhookVerifyToken` and credentials when verifying/sending requests.
- [x] T009 [US1] Delete `frontend/src/components/SettingsModal.tsx` and remove the global settings button from `frontend/src/components/Sidebar.tsx` (or header).
- [x] T010 [US1] Update `frontend/src/components/Sidebar.tsx` "Create Chat" flow (or new modal) to include input fields for all new chat settings (`phoneNumber`, `displayName`, `phoneNumberId`, `wabaId`, `webhookVerifyToken`, `webhookUrl`, `accessToken`).
- [x] T011 [US1] Update `frontend/src/components/ChatSettingsModal.tsx` to include all the aforementioned settings fields for editing an existing chat.
- [x] T012 [US1] Add UI info hints/tooltips to each setting attribute field in both the Create and Edit chat forms (e.g., using a small `?` icon on hover).

**Checkpoint**: At this point, the application uses per-chat settings exclusively, and the UI allows configuring them fully.

---

## Phase 4: User Story 2 - Chat UI Enhancements (Priority: P2)

**Goal**: Allow chats to have custom background colors and hashtags for better triage.

**Independent Test**: Assign a background color and tags to a chat, verify they are displayed and persisted.

### Implementation for User Story 2

- [x] T013 [P] [US2] Update `backend/src/api/chats.ts` to support saving/updating `tags` and `backgroundColor`.
- [x] T014 [US2] Update `frontend/src/components/ChatSettingsModal.tsx` (and Create Chat form) to include inputs for `tags` (comma-separated or list) and `backgroundColor` (color picker or hex string).
- [x] T015 [US2] Update `frontend/src/components/Sidebar.tsx` to display the `tags` underneath or next to the chat name in the chat list.
- [x] T016 [US2] Update `frontend/src/components/ChatWindow.tsx` (and potentially `MessageBubble.tsx`) to apply the custom `backgroundColor` to the chat view background.

**Checkpoint**: Customizations are applied per chat and visible in the UI.

---

## Phase 5: User Story 3 - Fix Chat Number Identity (Priority: P3)

**Goal**: Treat the "Chat Number" as the recipient (second party), not the sender (user).

**Independent Test**: The chat number displayed in the UI correctly reflects the person being messaged. 

### Implementation for User Story 3

- [x] T017 [P] [US3] Review and update backend message creation logic in `backend/src/api/messages.ts` (or similar) to ensure `recipientPhone` and `senderPhone` map correctly based on the updated logic (the WhatsApp account is the sender, the chat's `Contact.phoneNumber` is the recipient).
- [x] T018 [US3] Update `frontend/src/components/ChatWindow.tsx` and `frontend/src/components/Sidebar.tsx` to accurately label the numbers if they were misleading (e.g., showing the Contact's number prominently instead of the WABA sender number, if that was the bug).

**Checkpoint**: The chat logic and UI properly reflect the correct identity for the chat number.

---

## Dependencies & Execution Order

- **Phase 1 & Phase 2** must be completed first to lay the groundwork.
- **Phase 3 (US1)** depends on Phase 2.
- **Phase 4 (US2)** depends on Phase 2 (and preferably UI forms established in Phase 3).
- **Phase 5 (US3)** depends on Phase 2.

### Parallel Opportunities

- T007 and T008 can be done in parallel with frontend UI updates (T009-T012).
- T013 (backend tags/colors) can be done in parallel with T014-T016 (frontend UI updates).
- T017 can be done in parallel with T018.
