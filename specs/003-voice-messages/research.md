# Research: Voice Messages

## Audio File Storage Strategy
**Decision:** Store audio files in the backend filesystem (e.g., `backend/uploads/audio/`) and save the relative URL in the database.
**Rationale:** SQLite is not optimized for large BLOB storage (though audio files are small, storing base64 strings in SQLite will bloat the database). Storing on the filesystem and using Express to serve static files from `uploads/` is simple, fast, and closely mirrors standard architectures.
**Alternatives considered:** 
- Base64 encoding inside SQLite: Rejected due to database bloat.
- Cloud Storage (S3): Rejected because this is a local mock service.

## Frontend Audio Recording
**Decision:** Use the native browser `MediaRecorder` API combined with a custom UI instead of an external library.
**Rationale:** The `MediaRecorder` API is fully supported in modern browsers and avoids introducing heavy dependencies like `react-media-recorder` just to record a `.webm` or `.mp4` blob.
**Alternatives considered:** 
- `react-media-recorder` (External library): Rejected to reduce bundle size and external dependencies.

## Message Model Schema Update
**Decision:** Extend the existing `Message` model in Prisma. Add `type` (String, default "text") and `mediaUrl` (String, nullable).
**Rationale:** Allows a single message table to support both text and voice messages. WhatsApp supports many types (text, audio, image), so a `type` column is future-proof.
**Alternatives considered:**
- Creating a separate `VoiceMessage` table: Rejected as it overcomplicates queries for the message history.
