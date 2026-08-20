# Data Model: Whatsapp Mock Service

**Feature**: `001-whatsapp-mock`  
**Date**: 2026-08-21  

## SQLite Relational Schema (Prisma Format)

### 1. `Setting` Model (Single-row configuration)
Represents global configuration for the WhatsApp mock instance.

```prisma
model Setting {
  id                   String   @id @default("default")
  phoneNumber          String   @default("15550001111")
  displayName          String   @default("WhatsApp Business Mock")
  phoneNumberId        String   @default("100000000000001")
  wabaId               String   @default("200000000000002")
  accessToken          String   @default("mock_access_token_secret")
  webhookUrl           String   @default("http://localhost:8000/api/whatsapp/webhook")
  webhookVerifyToken   String   @default("mock_verify_token")
  updatedAt            DateTime @updatedAt
}
```

**Fields**:
- `id`: Static key (`default`) to ensure single-row singleton pattern.
- `phoneNumber`: Phone number associated with this mock instance (e.g. `15550001111`).
- `displayName`: Username / Business profile display name shown in chats.
- `phoneNumberId`: Meta Phone Number ID used in Cloud API URL parameters (`/v22.0/:phone_number_id/messages`).
- `wabaId`: WhatsApp Business Account ID passed in Webhook entries.
- `accessToken`: Bearer token for authenticating incoming API requests.
- `webhookUrl`: Target HTTP URL where outbound WhatsApp webhook payloads are sent when the UI user sends a message.
- `webhookVerifyToken`: Token used for webhook verification.

---

### 2. `Contact` Model
Represents a WhatsApp contact (chat recipient / sender).

```prisma
model Contact {
  id          String   @id @default(uuid())
  phoneNumber String   @unique // E.164 without plus or formatted digits
  name        String?  // Optional display name
  avatarUrl   String?  // Optional custom avatar or placeholder
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  chats       Chat[]
}
```

**Validation & State Rules**:
- `phoneNumber`: Unique index. Normalized (e.g. `1234567890`).

---

### 3. `Chat` Model
Represents an active conversation thread tied to a contact.

```prisma
model Chat {
  id            String    @id @default(uuid())
  contactId     String    @unique
  contact       Contact   @relation(fields: [contactId], references: [id], onDelete: Cascade)
  lastMessageAt DateTime  @default(now())
  unreadCount   Int       @default(0)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  messages      Message[]
}
```

---

### 4. `Message` Model
Represents individual text messages in a chat.

```prisma
enum MessageDirection {
  INBOUND  // Received from third-party service via POST /v22.0/:phone_number_id/messages
  OUTBOUND // Typed by UI user and dispatched to webhookUrl
}

enum MessageStatus {
  SENT
  DELIVERED
  READ
  FAILED
}

model Message {
  id             String           @id @default(uuid())
  chatId         String
  chat           Chat             @relation(fields: [chatId], references: [id], onDelete: Cascade)
  wamid          String           @unique // Meta message ID format (e.g., wamid.HBgL...)
  direction      MessageDirection
  senderPhone    String
  recipientPhone String
  textBody       String
  status         MessageStatus    @default(SENT)
  errorMessage   String?
  timestamp      DateTime         @default(now())
}
```

---

### 5. `WebhookLog` Model
Audit log for webhook delivery attempts dispatched to external integration services.

```prisma
model WebhookLog {
  id           String   @id @default(uuid())
  messageId    String?
  targetUrl    String
  payload      String   // JSON stringified webhook body
  responseCode Int?     // HTTP status code returned by target server (e.g., 200, 500)
  responseBody String?  // Stringified response body or error
  success      Boolean  @default(false)
  createdAt    DateTime @default(now())
}
```
