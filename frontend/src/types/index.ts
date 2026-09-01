export interface Contact {
  id: string;
  phoneNumber: string;
  name: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Chat {
  id: string;
  contactId: string;
  contact?: Contact;
  phoneNumber: string;
  displayName: string;
  phoneNumberId: string;
  wabaId: string;
  webhookVerifyToken: string;
  webhookUrl: string;
  accessToken: string;
  tags: string;
  backgroundColor: string;
  lastMessageAt: string;
  unreadCount: number;
  messages?: Message[];
}

export interface Media {
  id: string;
  filename: string;
  mimeType: string;
  fileSize: number;
  mediaType: string;
  storagePath: string;
  sha256: string;
  uploadedAt: string;
  expiresAt: string;
}

export interface LocationPayload {
  latitude: number;
  longitude: number;
  name?: string;
  address?: string;
}

export interface InteractivePayload {
  type: 'location_request_message' | 'request_contact_info' | string;
  body: { text: string };
  action?: { name?: string };
}

export interface SharedContact {
  origin?: 'contact_request' | 'other' | string;
  name?: { formatted_name?: string; first_name?: string };
  phones?: { phone: string; wa_id?: string; type?: string }[];
}

export interface Message {
  id: string;
  chatId: string;
  wamid: string;
  direction: 'INBOUND' | 'OUTBOUND';
  senderPhone: string;
  recipientPhone: string;
  textBody?: string;
  type: string;
  mediaUrl?: string;
  status: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  errorMessage?: string;
  timestamp: string;
  mediaId?: string;
  media?: Media;
  mediaLink?: string;
  mediaCaption?: string;
  mediaFilename?: string;
  payloadJson?: string | null;
  contextWamid?: string | null;
}

export interface WebhookLog {
  id: string;
  messageId: string | null;
  targetUrl: string;
  payload: string;
  responseCode: number | null;
  responseBody: string | null;
  success: boolean;
  createdAt: string;
}
