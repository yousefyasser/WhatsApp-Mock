# Feature Specification: Settings and Chat Enhancements

## Overview
This feature introduces per-chat settings (removing global settings), enhances the chat creation and editing UI, fixes the chat number identification issue, and adds UI customizations per chat (tags, background colors). It also ensures the Docker compose setup can access the host machine's localhost, specifically useful for webhook URLs.

## Requirements

### 1. Docker Compose Localhost Access
- Allow Docker containers to resolve and access the host machine's `localhost` (e.g., using `host.docker.internal` or host network mode) to facilitate local webhook testing.

### 2. Settings Architecture Revamp
- **Per-Chat Settings**: Remove global settings entirely. All settings must be defined and stored on a per-chat basis.
- **Chat Creation**: When a user creates a new chat, the UI must prompt them to fill out all available setting attributes.
- **Chat Editing**: The "Edit Settings" button for a chat must allow the user to view and update all setting attributes for that specific chat.
- **Info Hints**: Every setting attribute in the UI (creation and editing) must have a tooltip or info hint explaining its purpose.
- **Fix Chat Number Identity**: The system must treat the "Chat Number" as the second party's number (the person being messaged), rather than the sender's user number.

### 3. Chat UI Enhancements
- **Chat Tags**: Users can assign a set of hashtags to each chat for better triage and environmental differentiation.
- **Chat Background Color**: Users can change the background color of each chat (falling back to a default color if unset).

## Success Criteria
- Global settings are completely removed, and each chat functions independently with its own settings.
- Users can create and edit a chat, configuring all its settings and visual customizations directly.
- The chat number accurately reflects the recipient rather than the sender.
- Docker containers can successfully hit endpoints on the host machine using localhost.
