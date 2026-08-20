# Feature Specification: Whatsapp Mock Service

**Feature Branch**: `001-whatsapp-mock`  
**Created**: 2026-08-21  
**Status**: Draft  
**Input**: User description: "I want to build a simple mock of whatsapp for sending and receiving messages. The main purpose of this service is mocking whatsapp services for testing purposes with api integrated services."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Instance & WhatsApp Account Settings (Priority: P1)

As a developer testing a WhatsApp integration service, I want to configure the WhatsApp Mock instance settings (phone number, username/display name, phone_number_id, WABA ID, access token, and webhook target URL with verify token), so that the mock correctly reflects one specific WhatsApp Business number.

**Why this priority**: Core prerequisite for both receiving WhatsApp API requests from third-party services and delivering outbound webhooks.

**Independent Test**: Can be tested by opening the Settings screen in the UI, updating configuration fields, saving, and verifying that API requests reflect the updated `phone_number_id` and webhook destinations.

**Acceptance Scenarios**:
1. **Given** a newly installed instance, **When** navigating to the Settings screen, **Then** default values for phone number, display username, phone_number_id, and webhook config are presented.
2. **Given** updated settings entered by the user, **When** clicking Save, **Then** settings are persisted to SQLite and applied instantly to API endpoints and webhook dispatchers.

---

### User Story 2 - Simulating Inbound WhatsApp API Messages from Client Services (Priority: P1)

As an integrated third-party service, I want to call standard Meta WhatsApp Cloud API endpoints (`POST /v22.0/{phone_number_id}/messages`) to send text messages to contacts via the mock, so that I can test my outbound messaging integration without spending Meta API quotas or needing a real WhatsApp business account.

**Why this priority**: Main testing utility for services sending notifications or bot replies into WhatsApp.

**Independent Test**: Send an HTTP POST to `http://localhost:SERVER_PORT/v22.0/{phone_number_id}/messages` with standard WhatsApp Cloud API JSON payload containing recipient number and text body, and verify the message appears in the corresponding chat UI.

**Acceptance Scenarios**:
1. **Given** a valid request with `messaging_product: "whatsapp"`, `recipient_type: "individual"`, recipient `to`, and `type: "text"`, **When** sent to `POST /v22.0/{phone_number_id}/messages`, **Then** the mock returns standard Meta API JSON response (`{ messaging_product: "whatsapp", contacts: [{ input: "...", wa_id: "..." }], messages: [{ id: "wamid.HBgL..." }] }`) with HTTP status 200, creates or updates the chat, and displays the message as incoming from the integration service.
2. **Given** a request to mark a message as read (`status: "read"`, `message_id: "wamid..."`), **When** sent to `POST /v22.0/{phone_number_id}/messages`, **Then** the mock returns success response and updates the read state of the message in the UI.

---

### User Story 3 - Interactive Chat UI & Sending Webhook Events to Integration Services (Priority: P1)

As a tester interacting with the Web UI, I want to view active chats, select a contact, read message history, and send text replies, so that the mock automatically dispatches a standard Meta WhatsApp Webhook event payload (`POST`) to the configured integration webhook URL.

**Why this priority**: Allows manual end-to-end testing of webhook receivers and conversational AI / chatbot flows.

**Independent Test**: Create a chat in UI, type a text message, click Send, and verify that the backend dispatches a WhatsApp Webhook POST request containing the standard `object: "whatsapp_business_account"` entry/changes payload to the configured webhook endpoint.

**Acceptance Scenarios**:
1. **Given** an open chat in the UI, **When** the tester types a text message and hits Send, **Then** the message appears in the chat transcript as an outgoing message from the mock user and triggers an HTTP POST to the webhook endpoint.
2. **Given** a configured webhook endpoint that fails or returns non-200, **When** sending a message from UI, **Then** the UI displays the delivery status (e.g. Sent / Webhook Failed) without crashing the app.

---

### User Story 4 - Multi-Chat Management & Contact Support (Priority: P2)

As a user testing multi-user interactions, I want to create new chats with different phone numbers and switch seamlessly between active conversations in the UI.

**Why this priority**: Enables testing multi-user workflows, multi-tenant bots, and multi-conversation state management.

**Independent Test**: Click "New Chat", enter a recipient phone number and contact name, and verify a new chat item appears in the conversation list, allowing switching and isolated message histories.

**Acceptance Scenarios**:
1. **Given** the chat list sidebar, **When** clicking "New Chat" and entering phone number `+1234567890`, **Then** a new chat entry is created and focused.
2. **Given** multiple active chats, **When** selecting a chat from the sidebar, **Then** the main view switches to show that specific chat's message history and details.

---

### Edge Cases

- What happens when a third-party service calls `POST /v22.0/{phone_number_id}/messages` with an unconfigured `phone_number_id`? -> System accepts it if configured to auto-mock or returns Meta API error payload `400 Bad Request` if mismatching.
- How does the system handle non-text message types (e.g. image, audio, document, location, interactive)? -> Explicitly discarded/ignored with an informative log entry, as out of scope for v1.
- What happens if the webhook URL is unreachable or times out? -> Logged in Webhook logs table with error status code/message, UI shows notification/status indicator.
- How are phone numbers formatted? -> Normalized (digits only or E.164 without spaces/dashes) for consistent lookup.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST represent a single WhatsApp Business phone number instance per running service deployment.
- **FR-002**: System MUST provide a Settings screen to configure Account Phone Number, Display Name, Phone Number ID, WABA ID, Access Token, Webhook Target URL, and Webhook Verify Token.
- **FR-003**: System MUST store all settings, chats, contacts, and text messages persistently in a SQLite database.
- **FR-004**: System MUST implement standard Meta WhatsApp Cloud API endpoint `POST /v22.0/{phone_number_id}/messages` accepting text messages (`type: "text"`) and returning standard Meta Cloud API response structures.
- **FR-005**: System MUST implement `POST /v22.0/{phone_number_id}/messages` with `status: "read"` for marking messages read.
- **FR-006**: System MUST provide a web UI built with React JS displaying active chat list, chat search, conversation transcript, message composer, and settings panel.
- **FR-007**: System MUST automatically dispatch HTTP POST requests formatted according to Meta WhatsApp Cloud API Webhook standard (`object: "whatsapp_business_account"`) to the configured Webhook URL when a text message is sent from the UI.
- **FR-008**: System MUST support creating multiple chats with different recipient phone numbers.
- **FR-009**: System MUST ignore or return clean rejection for non-text message payloads (media, templates, interactive), as non-text messages are out of scope.
- **FR-010**: System MUST be structured as a TypeScript monorepo with `frontend` (React JS) and `backend` (Node.js) packages, dockerized via Docker Compose.

### Key Entities

- **InstanceSetting**: Represents global mock instance configuration (`phone_number`, `display_name`, `phone_number_id`, `waba_id`, `access_token`, `webhook_url`, `webhook_verify_token`).
- **Contact**: Represents a WhatsApp user/contact (`id`, `phone_number`, `name`, `created_at`, `updated_at`).
- **Chat**: Represents an active conversation (`id`, `contact_id`, `last_message_at`, `unread_count`, `created_at`).
- **Message**: Represents a text message (`id`, `chat_id`, `wamid`, `direction`: `INBOUND` | `OUTBOUND`, `sender_phone`, `recipient_phone`, `text_body`, `status`: `SENT` | `DELIVERED` | `READ` | `FAILED`, `timestamp`).
- **WebhookLog**: Records dispatched webhook HTTP requests, status codes, response bodies, and error logs for debugging.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% compatibility with standard WhatsApp Cloud API `POST /v22.0/{phone_number_id}/messages` payload and response schema for text messages.
- **SC-002**: Webhook event delivery dispatched within < 100ms of user clicking Send in the UI.
- **SC-003**: UI message rendering latency < 50ms upon receiving an inbound API message or sending an outbound message.
- **SC-004**: Complete startup of monorepo client and server via `docker-compose up` in under 30 seconds.

## Assumptions

- Single instance per container deployment (single WhatsApp number per deployment instance).
- Authentication for mock API endpoint is optional or configurable via Bearer token matching `access_token` in settings.
- E.164 phone number formatting without special characters will be used as standard identifier keys.
- Non-text messages (images, voice, video, templates, stickers) are ignored as specified in requirements.
