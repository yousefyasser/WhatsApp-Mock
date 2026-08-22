# Phase 0: Research & Clarifications

## 1. Docker Compose Localhost Access
**Decision**: Configure the backend service in `docker-compose.yml` to use `host.docker.internal` or host network mode.
**Rationale**: `host.docker.internal` is the standard way for Docker containers to resolve the host machine's IP, especially for testing webhooks locally. For Linux, we might need to add `extra_hosts: ["host.docker.internal:host-gateway"]` to the docker-compose file.

## 2. Chat Settings Revamp
**Decision**: Move all global settings to the Chat Prisma model (or related ChatSettings model) in the backend. Update frontend components to fetch and save settings per chat.
**Rationale**: Global settings are being deprecated in favor of independent chat configurations.

## 3. UI Enhancements
**Decision**: Add a `tags` field (array of strings) and a `backgroundColor` field (string) to the chat model. Update the frontend UI to display tags and apply the background color.
**Rationale**: Meets user requirements for better chat triage and personalization.

## 4. Chat Number Identity
**Decision**: Ensure that the "Chat Number" UI and backend logic properly references the recipient's phone number, not the sender's.
**Rationale**: Fixes the logical bug identified by the user.
