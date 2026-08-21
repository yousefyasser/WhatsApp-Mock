# Implementation Plan: Voice Messages

**Branch**: `main` | **Date**: 2026-08-21 | **Spec**: specs/003-voice-messages/spec.md

**Input**: Feature specification from `specs/003-voice-messages/spec.md`

## Summary

Introduce voice message support to the WhatsApp Mock Service. Users will be able to record, preview, send, and listen to voice messages in the chat history.

## Technical Context

**Language/Version**: TypeScript (Node.js, React)

**Primary Dependencies**: Express, Prisma, React, Vite. (New: `react-media-recorder` or native `MediaRecorder` API)

**Storage**: SQLite for message metadata. NEEDS CLARIFICATION on how to store the audio files (Base64 in SQLite vs Filesystem vs Cloud). We will assume Filesystem storage for now in research.

**Testing**: Manual.

**Target Platform**: Web Application.

**Project Type**: Web Application (Frontend + Backend).

**Performance Goals**: Fast audio upload and playback.

**Constraints**: Audio formats should be supported by modern browsers (e.g., `webm` or `mp4`/`aac`).

**Scale/Scope**: Local mock tool, file size limits can be modest (e.g., max 5MB).

## Constitution Check

*N/A - No specific constitution rules defined.*

## Project Structure

### Documentation (this feature)

```text
specs/003-voice-messages/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/
│   ├── routes/
│   └── uploads/        # Directory for storing audio files
└── tests/

frontend/
├── src/
│   ├── components/     # AudioRecorder, MessageBubble updates
│   ├── pages/
│   └── services/       # API endpoints for file upload
└── tests/
```

**Structure Decision**: Web application structure with an explicit `uploads/` directory on the backend for serving audio files.
