# Feature Specification: WhatsApp Mock Enhancements

## 1. Description
This feature introduces UI and backend enhancements to the WhatsApp mock application to better simulate the actual WhatsApp experience. It includes multi-line input, realistic message status indicators, chat-specific configuration for webhooks and tokens, and support for rich text formatting.

## 2. Requirements

### 2.1 Core Capabilities
- **Multi-line Input**: The message input box must allow multi-line text insertion when the user presses `Ctrl+Enter` (or `Cmd+Enter` on Mac).
- **Message Status Indicators**: The message history UI must display WhatsApp-style status indicators:
  - One grey check sign: "Message sent"
  - Two grey check signs: "Message delivered" (Note: User specified one check for "received", but standard WhatsApp is two grey for delivered/received)
  - Two blue check signs: "Message read"
- **Chat-specific Settings**: Access tokens and webhook URLs must be configured per individual chat rather than globally, allowing testing with multiple endpoints simultaneously.
- **Rich Text Parsing**: Message history must parse and render rich text content following WhatsApp conventions:
  - Asterisks (`*`) for bold text (e.g., `*Kofta*`).
  - Lists and multi-line breaks.

### 2.2 Constraints & Assumptions
- The frontend UI must implement the parsing logic to render WhatsApp markdown.
- Database schema changes are required to support chat-specific settings.

## 3. Data Model
- **Chat**: Add fields for `accessToken` and `webhookUrl`. (Wait, should setting fields be removed from `Setting` model? The requirements say "shall be configured by each new chat, not configured globally").

## 4. Interfaces
- Update backend API to allow setting access token and webhook URL per chat.
- Modify webhook dispatcher to use the chat-specific webhook URL instead of global settings.

## 5. Security & Privacy
- No significant changes to existing security posture.

## 6. Success Metrics
- Users can create new chats with custom webhook URLs.
- Webhooks for a specific chat are dispatched to its configured URL.
- Messages correctly display read/sent receipts.
- Messages correctly render rich text (bold, lists).
- Multi-line text can be input and sent properly.
