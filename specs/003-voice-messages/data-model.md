# Data Model: Voice Messages

## Prisma Schema Updates

We will update the `Message` model to support audio types.

```prisma
model Message {
  id             String   @id @default(uuid())
  chatId         String
  chat           Chat     @relation(fields: [chatId], references: [id], onDelete: Cascade)
  wamid          String   @unique
  direction      String   // "INBOUND" or "OUTBOUND"
  senderPhone    String
  recipientPhone String
  
  // Existing field for text
  textBody       String?  // Changed to optional to support media-only messages
  
  // New fields for media support
  type           String   @default("text") // "text" | "audio"
  mediaUrl       String?  // Relative URL to the file, e.g., "/uploads/audio/xyz.webm"
  
  status         String   @default("SENT") // "SENT", "DELIVERED", "READ", "FAILED"
  errorMessage   String?
  timestamp      DateTime @default(now())
}
```

## State Transitions
- **Audio Message Creation**: Frontend uploads a file -> Backend saves it to `/uploads/audio/` -> Creates `Message` with `type="audio"` and `mediaUrl="/uploads/audio/xyz.webm"`.
- **Playback**: Frontend reads `mediaUrl` -> constructs `<audio src={mediaUrl} />`.
