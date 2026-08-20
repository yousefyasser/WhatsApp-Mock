# Implementation Plan: Whatsapp Mock Service

**Branch**: `001-whatsapp-mock` | **Date**: 2026-08-21 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-whatsapp-mock/spec.md`

## Summary

Build a lightweight, dockerized WhatsApp Mock service to simulate sending and receiving text messages for testing integration services against Meta WhatsApp Cloud API specifications. The solution uses a client-server architecture with a React JS + TypeScript frontend and a Node.js + TypeScript + SQLite backend hosted in an `npm` workspaces monorepo. It supports single WhatsApp instance configuration, multi-chat management, standard Cloud API mocks (`POST /v22.0/:phone_number_id/messages`), and automated Meta Webhook event dispatching.

---

## Technical Context

**Language/Version**: TypeScript 5.0+, Node.js 18+, React 18+  
**Primary Dependencies**:
- **Backend**: Express.js, Prisma ORM, Socket.io, axios, cors, dotenv
- **Frontend**: React JS, Vite, Tailwind CSS, Lucide React, Socket.io-client, Axios  
**Storage**: SQLite (via Prisma ORM / file storage)  
**Testing**: Vitest / Jest (Unit & Contract tests)  
**Target Platform**: Linux / macOS / Windows server environment via Docker Compose  
**Project Type**: Monorepo Web Application (`frontend` + `backend`)  
**Performance Goals**: < 100ms response time for Cloud API requests, real-time message delivery via Socket.io  
**Constraints**: Only text messages are supported; other message types (images, audio, document, location, interactive) are ignored/discarded for v1.  
**Scale/Scope**: Single WhatsApp number per instance deployment; local & dockerized testing service.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Library-First / Component Isolation**: Clean separation between `frontend` React components and `backend` Express routes & webhook services. (PASS)
- **Standard Protocol**: Text message payloads strictly adhere to Meta WhatsApp Cloud API `v22.0` schema. (PASS)
- **Simplicity & Scope Boundary**: Non-text message types are explicitly discarded as out of scope for v1. SQLite zero-config file database used for rapid setup. (PASS)

---

## Project Structure

### Documentation (this feature)

```text
specs/001-whatsapp-mock/
├── spec.md              # Feature specification
├── plan.md              # Implementation plan (this file)
├── research.md          # Technology choices & Meta API specs
├── data-model.md        # SQLite Prisma data model schema
├── quickstart.md        # End-to-end testing & run guide
└── contracts/           # API & Webhook interface contracts
    ├── whatsapp-cloud-api.md
    ├── whatsapp-webhook.md
    └── internal-rest-api.md
```

### Source Code (repository root)

```text
package.json              # Monorepo workspaces setup (frontend, backend)
docker-compose.yml        # Docker compose container orchestration
Dockerfile.backend
Dockerfile.frontend

backend/                  # Node.js + Express + TypeScript backend
├── package.json
├── tsconfig.json
├── prisma/
│   └── schema.prisma     # SQLite data models (Setting, Contact, Chat, Message, WebhookLog)
└── src/
    ├── index.ts          # Express server & Socket.io server startup
    ├── config/           # App environment variables
    ├── db/               # Prisma database client singleton
    ├── routes/           # REST endpoints & Meta Cloud API mocks
    │   ├── settings.ts
    │   ├── chats.ts
    │   ├── messages.ts
    │   ├── webhookLogs.ts
    │   └── whatsappCloudApi.ts
    ├── services/         # Webhook dispatcher & chat business logic
    │   ├── chatService.ts
    │   ├── webhookDispatcher.ts
    │   └── settingService.ts
    └── ws/               # Real-time WebSockets event emitter
        └── socketHandler.ts

frontend/                 # React JS + Vite + TypeScript frontend
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── components/       # WhatsApp Web UI components
    │   ├── Sidebar.tsx
    │   ├── ChatWindow.tsx
    │   ├── MessageBubble.tsx
    │   ├── MessageInput.tsx
    │   ├── SettingsModal.tsx
    │   └── WebhookLogsModal.tsx
    ├── services/         # API client & Socket connection
    │   ├── api.ts
    │   └── socket.ts
    └── types/            # Shared TypeScript types
        └── index.ts
```

**Structure Decision**: Web application monorepo structure with `frontend` (React JS) and `backend` (Node.js) packages managed via npm workspaces and orchestrated via Docker Compose.

---

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| WebSockets (Socket.io) | Instant UI updates when external services POST to `/v22.0/:phone_number_id/messages` | HTTP Polling introduces delay and unnecessary network traffic during real-time testing |
