# Research & Technical Decisions: Whatsapp Mock Service

**Feature**: `001-whatsapp-mock`  
**Date**: 2026-08-21  

## 1. Monorepo & Architecture Strategy

### Decision: npm Workspaces
- **Chosen Option**: Root `package.json` utilizing native `npm` workspaces with two primary packages: `frontend` and `backend`.
- **Rationale**: Lightweight, no external CLI tool requirements (like Turborepo or Lerna), native Node.js/npm support, and simplifies Docker containerization.
- **Directory Layout**:
  ```text
  whatsapp-mocked/
  ├── package.json              # Root package.json defining workspaces
  ├── docker-compose.yml        # Docker compose configuration
  ├── backend/                  # Node.js + Express + TypeScript + SQLite backend
  │   ├── Dockerfile
  │   ├── package.json
  │   ├── tsconfig.json
  │   ├── src/
  │   │   ├── index.ts          # Express server entry point
  │   │   ├── config/           # App configuration
  │   │   ├── db/               # SQLite database & Prisma schema
  │   │   ├── routes/           # REST & WhatsApp Cloud API endpoints
  │   │   ├── services/         # Webhook dispatcher & Chat service
  │   │   └── ws/               # WebSocket/Socket.io real-time handler
  └── frontend/                 # React JS + Vite + TypeScript + Tailwind CSS frontend
      ├── Dockerfile
      ├── package.json
      ├── tsconfig.json
      ├── vite.config.ts
      └── src/
          ├── App.tsx
          ├── components/       # Chat, Sidebar, Settings, Message components
          ├── services/         # REST API & Socket client
          └── types/            # TypeScript interfaces
  ```

---

## 2. Backend Stack & Database Selection

### Decision: Node.js + Express.js + Prisma ORM with SQLite + Socket.io
- **Backend Framework**: Express.js with TypeScript (`tsx` for dev runtime, `tsc` for production build). Express is robust, lightweight, and ideal for standard REST API endpoints and webhooks.
- **Database & Persistence**: SQLite using **Prisma ORM**. Prisma handles SQLite schema creation, migrations, and provides fully typed query clients.
- **Real-Time Communication**: **Socket.io** integrated into the Express HTTP server.
  - When third-party services call `POST /v22.0/{phone_number_id}/messages`, the backend saves the message and emits a `message:received` socket event to connected React UI clients.
  - Ensures instant UI updates without polling.

---

## 3. Frontend Stack & UI Design

### Decision: React JS + Vite + Tailwind CSS + Lucide Icons + Socket.io-client
- **Build Tool & Framework**: React 18+ with Vite and TypeScript.
- **UI & Styling**: Tailwind CSS styled to mirror WhatsApp Web aesthetics (chat sidebar with contacts, active chat window with message bubbles, header with user profile, and modal/tab for Settings).
- **Icons**: `lucide-react` for clean UI icons (Search, Settings, MessageSquare, Send, Check, CheckCheck).

---

## 4. Meta WhatsApp Cloud API Specifications

### Endpoint 1: Outbound Message Sending API Mock
- **Route**: `POST /v22.0/:phone_number_id/messages`
- **Headers**: `Authorization: Bearer <TOKEN>`, `Content-Type: application/json`
- **Request Body (Text Message)**:
  ```json
  {
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": "1234567890",
    "type": "text",
    "text": {
      "preview_url": false,
      "body": "Hello from client service"
    }
  }
  ```
- **Response Body (200 OK)**:
  ```json
  {
    "messaging_product": "whatsapp",
    "contacts": [
      {
        "input": "1234567890",
        "wa_id": "1234567890"
      }
    ],
    "messages": [
      {
        "id": "wamid.HBgLMjAxMjM0NTY3ODkwFQIAERgSQUU1REI4ODRBRTRFNEMyODg0AA=="
      }
    ]
  }
  ```

### Endpoint 2: Mark Message as Read API Mock
- **Route**: `POST /v22.0/:phone_number_id/messages`
- **Request Body**:
  ```json
  {
    "messaging_product": "whatsapp",
    "status": "read",
    "message_id": "wamid.HBgLMjAxMjM0NTY3ODkwFQIAERgSQUU1REI4ODRBRTRFNEMyODg0AA=="
  }
  ```
- **Response Body (200 OK)**:
  ```json
  {
    "success": true
  }
  ```

---

## 5. Webhook Event Dispatcher Specification

When a user types a text message in the React UI and clicks Send:
1. Backend creates/stores the message in SQLite (`direction: OUTBOUND` from user point of view / incoming for integration server).
2. Backend generates a random `wamid` ID.
3. Backend dispatches an HTTP `POST` request to the configured `webhook_url` with the standard Meta WhatsApp Webhook payload format:
   ```json
   {
     "object": "whatsapp_business_account",
     "entry": [
       {
         "id": "<WABA_ID>",
         "changes": [
           {
             "value": {
               "messaging_product": "whatsapp",
               "metadata": {
                 "display_phone_number": "<ACCOUNT_PHONE_NUMBER>",
                 "phone_number_id": "<PHONE_NUMBER_ID>"
               },
               "contacts": [
                 {
                   "profile": {
                     "name": "<USERNAME>"
                   },
                   "wa_id": "<SENDER_PHONE_NUMBER>"
                 }
               ],
               "messages": [
                 {
                   "from": "<SENDER_PHONE_NUMBER>",
                   "id": "wamid.HBgL...",
                   "timestamp": "1724190000",
                   "text": {
                     "body": "User typed message"
                   },
                   "type": "text"
                 }
               ]
             },
             "field": "messages"
           }
         ]
       }
     ]
   }
   ```
4. Delivery status and response status code are recorded in `WebhookLog` table.

---

## 6. Dockerization & Deployment Strategy

- **`docker-compose.yml`**: Configures multi-service deployment:
  - `backend`: Port 3000 mapped to host. SQLite volume mounted for data persistence.
  - `frontend`: Port 80 (or 5173 for Vite preview) mapped to host, proxying API requests to `backend`.
- **Health Checks & Environment Variables**: Clean configuration via `.env` file or environment overrides.
