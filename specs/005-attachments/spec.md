# Feature Specification: Media Attachments

**Feature Branch**: `005-attachments`

**Created**: 2026-08-26

**Status**: Draft

**Input**: User description: "I want to add a new specs for a new feature. The service needs to support files and images attachments same as whats app real service. It is very important to follow whatsapp api standards and conventions as this service is supposed to be a mirror of whatsapp service."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Upload Media (Priority: P1)

As an API client, I need to be able to upload media files (images, documents, etc.) to the service so that I can later send them in messages.

**Why this priority**: Media must be uploaded and stored before it can be sent as an attachment. This is the foundational step for media support.

**Independent Test**: Can be fully tested by uploading a file via the media endpoint and receiving a valid media ID in response.

**Acceptance Scenarios**:

1. **Given** a valid media file (e.g., JPEG, PDF), **When** the client sends a POST request to the media upload endpoint with the file, **Then** the service saves the file and returns a unique media ID.
2. **Given** an unsupported file type, **When** the client attempts to upload it, **Then** the service rejects the request with an appropriate error response.
3. **Given** a file exceeding the maximum size limit, **When** the client attempts to upload it, **Then** the service rejects the request with a size limit error.

---

### User Story 2 - Send Media Message (Priority: P1)

As an API client, I need to send messages containing media attachments using previously uploaded media IDs or external URLs, so that recipients receive the files or images.

**Why this priority**: Sending the media is the primary value of the feature, mirroring the core WhatsApp capability of sharing attachments.

**Independent Test**: Can be tested by sending a message payload with a media type (e.g., image, document) and a media ID, and verifying the message is processed and dispatched correctly.

**Acceptance Scenarios**:

1. **Given** a valid uploaded media ID, **When** the client sends a message request specifying the media ID and type (e.g., image), **Then** the service processes the message and formats it according to WhatsApp API conventions.
2. **Given** a valid external media URL, **When** the client sends a message request specifying the link, **Then** the service processes the message using the provided link.
3. **Given** an invalid or expired media ID, **When** the client attempts to send a message with it, **Then** the service returns an error indicating the media was not found.

---

### User Story 3 - Download Media (Priority: P2)

As a webhook receiver, I need to be able to download media files sent to me by users, using the media ID provided in the incoming message notification.

**Why this priority**: Receiving and downloading media from users is critical for two-way communication, though slightly lower priority than outbound sending.

**Independent Test**: Can be tested by requesting the media download endpoint with a valid media ID and receiving the file content.

**Acceptance Scenarios**:

1. **Given** a valid media ID from an incoming message, **When** the client requests the media download URL, **Then** the service returns a URL to download the media.
2. **Given** the download URL, **When** the client makes an authenticated request to it, **Then** the service serves the media file content.

---

### Edge Cases

- What happens when two clients upload files with the same name simultaneously?
- How does the system handle media IDs that expire? (WhatsApp API typically expires media after 30 days)
- What happens if the server storage is full during a media upload?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide an endpoint to upload media files via `multipart/form-data`, returning a unique media ID, strictly following WhatsApp Cloud API structure.
- **FR-002**: System MUST support sending messages of types: `image`, `document`, `audio`, `video`, and `sticker`.
- **FR-003**: System MUST allow sending media messages either by providing a `id` (uploaded media ID) or a `link` (external URL).
- **FR-004**: System MUST provide an endpoint to retrieve a media URL using a media ID (`GET /v1.0/{media-id}`).
- **FR-005**: System MUST provide a secure way to download the actual media content using the retrieved URL.
- **FR-006**: System MUST enforce WhatsApp's exact maximum file size limits per media type: image 5 MB, audio/video 16 MB, document 100 MB, sticker 100 KB (static) / 500 KB (animated). This ensures full client compatibility parity.
- **FR-007**: System MUST validate MIME types for uploaded files to ensure they match supported WhatsApp formats.

### Key Entities

- **Media**: Represents an uploaded file. Attributes include: ID, file name, MIME type, size, storage path, upload timestamp, and expiration date.
- **Message (Media payload)**: The specific payload structure for media messages, containing the media type, ID/link, and optional caption or filename.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: API clients can upload a 5MB image and receive a media ID in under 1 second.
- **SC-002**: The JSON structure of media upload responses and media message payloads has 100% parity with the official WhatsApp Cloud API documentation.
- **SC-003**: API clients can retrieve and download media using the standard two-step WhatsApp process (get URL, then download).

## Assumptions

- We assume local file system storage is sufficient for the mocked service (no cloud blob storage like S3 is required initially).
- Media files are not permanently retained and can be cleaned up periodically to simulate WhatsApp's 30-day retention policy.
- Authentication for downloading media will follow the same Bearer token approach as the rest of the mocked API.
