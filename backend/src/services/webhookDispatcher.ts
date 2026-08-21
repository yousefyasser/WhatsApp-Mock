import axios from 'axios';
import prisma from '../db/client';
import { getSettings } from './settingService';

export const dispatchWebhook = async (message: any, contact: any) => {
  const settings = await getSettings();
  const chat = await prisma.chat.findUnique({ where: { id: message.chatId } });
  
  if (!chat || !chat.webhookUrl) return;

  const payload = {
    object: "whatsapp_business_account",
    entry: [{
      id: settings.wabaId,
      changes: [{
        field: "messages",
        value: {
          messaging_product: "whatsapp",
          metadata: {
            display_phone_number: settings.phoneNumber,
            phone_number_id: settings.phoneNumberId
          },
          contacts: [{
            profile: { name: contact.name || contact.phoneNumber },
            wa_id: contact.phoneNumber
          }],
          messages: [{
            from: contact.phoneNumber,
            id: message.wamid,
            timestamp: Math.floor(message.timestamp.getTime() / 1000).toString(),
            type: message.type || "text",
            ...(message.type === 'audio' 
              ? { audio: { id: message.id, mime_type: 'audio/webm' } }
              : { text: { body: message.textBody } })
          }]
        }
      }]
    }]
  };

  let success = false;
  let responseCode = null;
  let responseBody = null;

  try {
    const res = await axios.post(chat.webhookUrl, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 60000
    });
    success = res.status >= 200 && res.status < 300;
    responseCode = res.status;
    responseBody = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
  } catch (err: any) {
    responseCode = err.response?.status || 500;
    responseBody = err.message;
  }

  await prisma.webhookLog.create({
    data: {
      messageId: message.id,
      targetUrl: chat.webhookUrl,
      payload: JSON.stringify(payload),
      responseCode,
      responseBody,
      success
    }
  });

  return success;
};
