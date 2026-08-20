# Quickstart & End-to-End Validation Guide: Whatsapp Mock Service

**Feature**: `001-whatsapp-mock`  
**Date**: 2026-08-21  

This guide provides step-by-step instructions to set up, run, and validate the WhatsApp Mock Service locally or via Docker Compose.

---

## 1. Prerequisites

- **Node.js**: v18+ and `npm` v9+ installed locally
- **Docker & Docker Compose**: Installed for containerized setup
- **cURL**: Installed for testing WhatsApp API endpoints

---

## 2. Local Setup & Execution

### Install Dependencies
From the repository root:
```bash
npm install
```

### Database Initialization
Run Prisma migrations for the SQLite backend:
```bash
npm run db:push --workspace=backend
```

### Start Development Server
Start backend and frontend concurrently:
```bash
npm run dev
```
- **Backend API**: `http://localhost:3000`
- **React Frontend**: `http://localhost:5173`

---

## 3. Docker Compose Setup

Run the entire monorepo in Docker:
```bash
docker-compose up --build
```
- **Frontend App**: `http://localhost:80`
- **Backend Server**: `http://localhost:3000`

---

## 4. End-to-End Validation Scenarios

### Scenario A: Verify Settings UI & API
1. Open `http://localhost:5173` (or `http://localhost:80` for Docker).
2. Click the **Settings** icon/tab.
3. Configure:
   - **Phone Number**: `15550001111`
   - **Display Name**: `My Test WhatsApp Business`
   - **Phone Number ID**: `100000000000001`
   - **Webhook URL**: `http://host.docker.internal:8000/api/whatsapp/webhook`
4. Click **Save Settings**.
5. **Expected Result**: Settings are saved to SQLite and confirmed via UI toast/alert.

---

### Scenario B: Test Receiving Inbound WhatsApp Cloud API Request (`POST /v22.0/:phone_number_id/messages`)
Simulate a third-party server sending a WhatsApp message to the mock:

```bash
curl -X POST http://localhost:3000/v22.0/100000000000001/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer mock_access_token_secret" \
  -d '{
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": "1234567890",
    "type": "text",
    "text": {
      "body": "Hello from external integration service!"
    }
  }'
```

**Expected Response**:
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

**UI Verification**:
- In the React UI, a new chat with `1234567890` appears in the sidebar.
- Selecting the chat displays `"Hello from external integration service!"` as an incoming message bubble.

---

### Scenario C: Test Outbound Webhook Delivery from UI
1. Select the chat with `1234567890` in the React UI.
2. Type `"Hello, this is a response from the WhatsApp Mock UI"` in the message input box and hit **Send**.
3. **Expected Result**:
   - The message bubble appears in the conversation window.
   - The backend dispatches a Meta WhatsApp Webhook event HTTP `POST` to the configured `webhookUrl`.
   - Webhook delivery details (HTTP status code, payload) are recorded in the **Webhook Logs** tab in the UI.
