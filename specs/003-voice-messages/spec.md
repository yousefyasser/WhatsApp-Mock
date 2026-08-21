# Feature Specification: Voice Messages

## Overview
Introduce and support voice messages similar to WhatsApp. 

## Requirements
- **Record Voice Messages**: Users can start and stop recording voice messages via the UI.
- **Preview Voice Messages**: Users can listen to their recorded voice message before sending it.
- **Send Voice Messages**: Users can send the recorded voice message to the active chat.
- **Message History**: Users can retrieve, play, and listen to old voice messages within the chat history.

## Scope
Backend:
- API endpoint to upload and store voice messages (audio files).
- Update the message model to support `audio` message types.
- Serve audio files to the frontend.

Frontend:
- UI for voice recording (microphone integration).
- UI for previewing an audio blob.
- Upload mechanism to send the audio to the backend.
- UI in the message history to render an audio player for voice messages.
