# Implementation Tasks: WhatsApp Mock Enhancements

## Phase 1: Setup
- [x] T001 Install `lucide-react` in frontend for message status icons (`cd frontend && npm install lucide-react`)

## Phase 2: Foundational (Database & Schema)
- [x] T002 Update Prisma Schema in `backend/prisma/schema.prisma` to remove `webhookUrl` and `accessToken` from `Setting` and add them to `Chat`
- [ ] T003 Apply database schema changes by running `docker compose exec backend npx prisma db push` and `docker compose restart backend`

## Phase 3: [US1] Chat-Specific Settings
- [x] T004 [P] [US1] Update API in `backend/src/routes/settings.ts` to remove `webhookUrl` and `accessToken` from the responses and updates
- [x] T005 [P] [US1] Update API in `backend/src/routes/chats.ts` to accept and save `webhookUrl` and `accessToken` when creating a new chat
- [x] T006 [US1] Update `dispatchWebhook` in `backend/src/services/webhookDispatcher.ts` to fetch settings from the specific `Chat` instead of global `Setting`
- [x] T007 [P] [US1] Update TypeScript interfaces in `frontend/src/types/index.ts` for `Setting` and `Chat`
- [x] T008 [US1] Update frontend `frontend/src/components/SettingsModal.tsx` to remove the global `webhookUrl` and `accessToken` inputs
- [x] T009 [US1] Update frontend `frontend/src/components/Sidebar.tsx` to add `webhookUrl` and `accessToken` inputs when creating a new chat

## Phase 4: [US2] Multi-line Input
- [x] T010 [P] [US2] Update `frontend/src/components/MessageInput.tsx` to use a `<textarea>` instead of `<input>` and handle `Ctrl+Enter` and `Shift+Enter` for multi-line inputs

## Phase 5: [US3] Message Status UI
- [x] T011 [P] [US3] Update `frontend/src/components/MessageBubble.tsx` to display WhatsApp-style checkmarks using `lucide-react` based on message status (SENT, DELIVERED, READ)

## Phase 6: [US4] Rich Text Rendering
- [x] T012 [P] [US4] Create a markdown parser utility in `frontend/src/utils/whatsappMarkdownParser.ts` using regex to convert WhatsApp markdown to HTML/React elements
- [x] T013 [US4] Update `frontend/src/components/MessageBubble.tsx` to render the parsed rich text using the new utility

## Phase 7: Polish & Cross-Cutting
- [x] T014 Verify all frontend components compile without errors and run cleanly (`cd frontend && npm run build`)
- [x] T015 Verify backend starts correctly and API endpoints work properly

## Dependencies
- US1 (Chat-Specific Settings) depends on Foundational DB schema changes.
- US2, US3, US4 are independent frontend changes and can be executed in parallel after Setup.

## Parallel Execution Examples
- Developer A implements Phase 3 (US1 - Backend API and Settings UI).
- Developer B implements Phase 4 (US2 - Multi-line Input).
- Developer C implements Phase 6 (US4 - Rich text parsing utility).
