# Tasks: Whatsapp Mock Service

**Input**: Design documents from `/specs/001-whatsapp-mock/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Monorepo workspace setup and Docker orchestration

- [X] T001 Create monorepo `package.json` with npm workspaces (`frontend`, `backend`) in `package.json`
- [X] T002 Initialize Node.js backend workspace with Express, Prisma, TypeScript, Socket.io, axios, cors, dotenv in `backend/package.json` and `backend/tsconfig.json`
- [X] T003 [P] Initialize React JS frontend workspace with Vite, TypeScript, Tailwind CSS, Lucide React, Socket.io-client in `frontend/package.json`, `frontend/tsconfig.json`, and `frontend/vite.config.ts`
- [X] T004 [P] Configure Docker containers and multi-container orchestration in `backend/Dockerfile`, `frontend/Dockerfile`, and `docker-compose.yml`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database schema, API setup, Socket.io real-time engine, and shared TypeScript types

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 Setup Prisma database schema with `Setting`, `Contact`, `Chat`, `Message`, and `WebhookLog` models in `backend/prisma/schema.prisma`
- [X] T006 Setup Prisma client singleton instance in `backend/src/db/client.ts`
- [X] T007 [P] Setup Express server app, CORS, JSON body parser middleware, and Socket.io server attachment in `backend/src/index.ts`
- [X] T008 [P] Implement Socket.io server event emitter module in `backend/src/ws/socketHandler.ts`
- [X] T009 [P] Setup Axios API HTTP client and Socket.io client service in `frontend/src/services/api.ts` and `frontend/src/services/socket.ts`
- [X] T010 [P] Define shared TypeScript interfaces for Settings, Contact, Chat, Message, and WebhookLog in `frontend/src/types/index.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Instance & WhatsApp Account Settings (Priority: P1)

**Goal**: Configure instance settings (Phone Number, Display Username, Phone Number ID, WABA ID, Access Token, Webhook Target URL, Verify Token) via UI and persist to SQLite.

**Independent Test**: Open Settings modal in UI, update values, click Save, and verify `GET /api/settings` returns updated values.

- [X] T011 [P] [US1] Implement settings database access and seed defaults service in `backend/src/services/settingService.ts`
- [X] T012 [US1] Implement REST API routes `GET /api/settings` and `PUT /api/settings` in `backend/src/routes/settings.ts`
- [X] T013 [US1] Register settings routes with Express app in `backend/src/index.ts`
- [X] T014 [P] [US1] Build React Settings modal component in `frontend/src/components/SettingsModal.tsx`
- [X] T015 [US1] Integrate Settings modal into main view header in `frontend/src/App.tsx`

**Checkpoint**: User Story 1 fully functional and testable independently

---

## Phase 4: User Story 2 - Simulating Inbound WhatsApp API Messages from Client Services (Priority: P1)

**Goal**: Third-party integrated services call `POST /v22.0/{phone_number_id}/messages` to send text messages or mark messages as read.

**Independent Test**: Send an HTTP POST to `http://localhost:3000/v22.0/100000000000001/messages` with text body payload and verify 200 OK response and chat creation in UI.

- [X] T016 [P] [US2] Implement chat and contact management business logic service in `backend/src/services/chatService.ts`
- [X] T017 [US2] Implement Meta Cloud API endpoint handler `POST /v22.0/:phone_number_id/messages` for text messages and `status: "read"` in `backend/src/routes/whatsappCloudApi.ts`
- [X] T018 [US2] Register Meta Cloud API mock routes with Express app in `backend/src/index.ts`
- [X] T019 [US2] Emit `message:received` WebSocket event when an inbound Cloud API message is processed in `backend/src/services/chatService.ts`

**Checkpoint**: User Story 2 fully functional and testable independently via cURL / Postman

---

## Phase 5: User Story 3 - Interactive Chat UI & Sending Webhook Events to Integration Services (Priority: P1) 🎯 MVP

**Goal**: View active chats, read transcripts, type text replies in UI, and automatically dispatch Meta WhatsApp Webhook payloads to external services.

**Independent Test**: Type a text message in the React UI chat input, click Send, verify message appears in transcript and Webhook POST payload is delivered to integration endpoint.

- [X] T020 [P] [US3] Implement HTTP Webhook dispatcher and logger service in `backend/src/services/webhookDispatcher.ts`
- [X] T021 [US3] Implement internal REST API routes `GET /api/chats`, `GET /api/chats/:chatId/messages`, and `POST /api/chats/:chatId/messages` in `backend/src/routes/chats.ts` and `backend/src/routes/messages.ts`
- [X] T022 [P] [US3] Implement Webhook delivery logs endpoint `GET /api/webhook-logs` in `backend/src/routes/webhookLogs.ts`
- [X] T023 [P] [US3] Build Chat Window header and Message Bubble list components in `frontend/src/components/ChatWindow.tsx` and `frontend/src/components/MessageBubble.tsx`
- [X] T024 [P] [US3] Build Message Composer input component in `frontend/src/components/MessageInput.tsx`
- [X] T025 [P] [US3] Build Webhook Delivery Logs modal component in `frontend/src/components/WebhookLogsModal.tsx`
- [X] T026 [US3] Integrate ChatWindow, MessageInput, WebhookLogsModal, and real-time Socket.io listeners in `frontend/src/App.tsx`

**Checkpoint**: MVP Complete - User Stories 1, 2, and 3 fully functional end-to-end

---

## Phase 6: User Story 4 - Multi-Chat Management & Contact Support (Priority: P2)

**Goal**: Manage multiple conversations, search contacts, create new chats with phone numbers, and switch between active threads.

**Independent Test**: Click New Chat in sidebar, enter phone number `1234567890`, verify new chat created and switch conversation views smoothly.

- [X] T027 [P] [US4] Add support for creating new contact and chat via `POST /api/chats` in `backend/src/routes/chats.ts`
- [X] T028 [P] [US4] Build Chat Sidebar component with contact search filter and New Chat button in `frontend/src/components/Sidebar.tsx`
- [X] T029 [US4] Connect Sidebar contact selection, search filtering, and New Chat creation modal in `frontend/src/App.tsx`

**Checkpoint**: All user stories functional independently and together

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Styling refinements, error handling, docker validation

- [X] T030 [P] Apply WhatsApp Web theme styling and global utility classes in `frontend/src/index.css` and `frontend/tailwind.config.js`
- [X] T031 Add error handling and input sanitization for invalid phone numbers and failed webhook attempts across backend controllers
- [X] T032 Validate end-to-end quickstart scenarios in `specs/001-whatsapp-mock/quickstart.md` using `docker-compose up`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) - BLOCKS all User Stories
- **User Story 1 (Phase 3)**: Depends on Phase 2 - No dependencies on other stories
- **User Story 2 (Phase 4)**: Depends on Phase 2 & SettingService - No dependency on US3/US4
- **User Story 3 (Phase 5)**: Depends on Phase 2 & WebhookDispatcher - Primary MVP core
- **User Story 4 (Phase 6)**: Depends on Phase 2 & US3 Chat components
- **Polish (Phase 7)**: Depends on completion of User Stories 1-4

---

## Parallel Execution Opportunities

- **Phase 1**: T003 (Frontend init) and T004 (Docker config) in parallel after T001/T002
- **Phase 2**: T007 (Express server), T008 (Sockets), T009 (Frontend API client), T010 (Types) in parallel after T005/T006 Prisma setup
- **User Story 1**: T011 (SettingService) and T014 (SettingsModal) in parallel
- **User Story 2**: T016 (ChatService) in parallel with US1 work
- **User Story 3**: T020 (WebhookDispatcher), T022 (WebhookLogs route), T023 (ChatWindow), T024 (MessageInput), T025 (WebhookLogsModal) in parallel
- **User Story 4**: T027 (Backend chat create) and T028 (Sidebar component) in parallel
