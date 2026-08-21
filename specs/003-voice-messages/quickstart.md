# Quickstart: Voice Messages

## Validation Scenario: E2E Voice Message Flow

This scenario proves that the voice messaging feature works from end to end.

### Prerequisites
1. Backend is running and serving static files from `uploads/`.
2. Frontend is running.

### Execution Steps
1. Open the browser and select a chat.
2. Click the new "Microphone" icon next to the message input.
3. Speak into your microphone for a few seconds.
4. Click the "Stop" icon to finish recording.
5. An audio preview player will appear above the input. Click "Play" on the preview to listen to what you just recorded.
6. Click the "Send" icon.
7. Observe that a new message bubble appears instantly in the chat history.
8. The message bubble should contain an audio player instead of text.
9. Click "Play" on the message bubble to verify the audio plays back successfully via the URL served by the backend (e.g., `http://localhost:3000/uploads/audio/xyz.webm`).

### Expected Outcome
The audio message is successfully recorded, previewed, sent, and played back from the chat history. The database correctly stores the message with `type="audio"` and the `mediaUrl`.
