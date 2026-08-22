# Implementation Plan: Settings Enhancements

**Branch**: `master` | **Date**: 2026-08-22 | **Spec**: [004-settings-enhancements/spec.md](file:///home/mahmoudrizk/Desktop/my_desktop/ordr-project/whatsapp-mocked/specs/004-settings-enhancements/spec.md)

**Input**: Feature specification from `/specs/004-settings-enhancements/spec.md`

## Summary

Move settings from a global context to per-chat context, update the chat creation and editing UI to expose all attributes with info hints, fix the chat number identity, add tags and background colors to chats, and enable docker-compose containers to resolve localhost (via `host.docker.internal`).

## Technical Context

**Language/Version**: TypeScript / Node.js

**Primary Dependencies**: Prisma, React, Docker Compose

**Storage**: Prisma / PostgreSQL (or SQLite)

**Testing**: Jest / React Testing Library

**Target Platform**: Web (Dockerized)

**Project Type**: Web Application

**Performance Goals**: Fast UI responsiveness when opening chat settings.

**Constraints**: Docker compose must use `extra_hosts` to resolve `host.docker.internal` across OSes.

**Scale/Scope**: Update to existing Prisma schema and React components.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

No constitution violations.

## Project Structure

### Documentation (this feature)

```text
specs/004-settings-enhancements/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/ (Prisma schema)
│   ├── services/
│   └── api/
└── docker-compose.yml (or root docker-compose.yml)

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
```

**Structure Decision**: Standard web application structure with separate backend and frontend directories.
