export interface Setting {
  id: string;
  phoneNumber: string;
  displayName: string;
  phoneNumberId: string;
  wabaId: string;
  webhookVerifyToken: string;
  updatedAt: string;
}

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
  webhookUrl: string;
  accessToken: string;
  lastMessageAt: string;
  unreadCount: number;
  messages?: Message[];
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
  errorMessage: string | null;
  timestamp: string;
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
