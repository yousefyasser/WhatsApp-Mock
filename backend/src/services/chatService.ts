import prisma from '../db/client';
import { getSocket } from '../ws/socketHandler';

export const handleIncomingApiMessage = async (toPhone: string, textBody: string) => {
  // Find or create contact
  let contact = await prisma.contact.findUnique({ where: { phoneNumber: toPhone } });
  if (!contact) {
    contact = await prisma.contact.create({ data: { phoneNumber: toPhone, name: toPhone } });
  }

  // Find or create chat
  let chat = await prisma.chat.findUnique({ where: { contactId: contact.id } });
  if (!chat) {
    chat = await prisma.chat.create({ data: { contactId: contact.id } });
  }

  // Create message
  const wamid = `wamid.HBgL${Math.random().toString(36).substring(2, 15)}`;
  const message = await prisma.message.create({
    data: {
      chatId: chat.id,
      wamid,
      direction: 'INBOUND',
      senderPhone: '1000000000', // Mock system sender
      recipientPhone: toPhone,
      textBody,
      status: 'DELIVERED'
    },
    include: { chat: { include: { contact: true } } }
  });

  // Update chat lastMessageAt and unread
  await prisma.chat.update({
    where: { id: chat.id },
    data: { lastMessageAt: new Date(), unreadCount: { increment: 1 } }
  });

  // Emit websocket event
  const io = getSocket();
  io.emit('message:received', message);

  return message;
};

export const markMessageRead = async (wamid: string) => {
  const msg = await prisma.message.update({
    where: { wamid },
    data: { status: 'READ' }
  });
  const io = getSocket();
  io.emit('message:status', msg);
  return msg;
};
