# Quickstart: Validation Guide for Enhancements

## 1. Setup
1. Rebuild the database schema (after Prisma migrations):
   ```bash
   docker compose exec backend npx prisma db push
   docker compose restart backend
   ```

## 2. Validation Scenarios

### Scenario A: Chat-Specific Settings
1. Open the UI.
2. Click "New Chat".
3. Verify that the form now asks for "Webhook URL" and "Access Token" in addition to the phone number.
4. Create the chat and verify in the database (`docker compose exec backend npx prisma studio`) that the `Chat` row contains the webhook URL.

### Scenario B: Multi-line Input
1. Open any chat.
2. Type "Line 1" in the message input.
3. Press `Ctrl+Enter` (or `Cmd+Enter` on Mac).
4. Type "Line 2" and press `Enter` (without modifier).
5. Verify that the message is sent and appears as multiple lines in the chat history.

### Scenario C: Rich Text Rendering
1. Send a message containing `*Bold Text*`, `_Italic_`, and a multi-line list (like the sample from the spec).
2. Verify that the UI renders the bold text properly instead of showing the literal asterisks.

### Scenario D: Message Status UI
1. Send an outbound message.
2. Verify it shows a single checkmark (Sent).
3. If the mock automatically updates statuses (or if we update the database manually to `DELIVERED` or `READ`), verify the UI shows two grey checks or two blue checks, respectively.
