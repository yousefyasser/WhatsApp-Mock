import { Router } from 'express';
import prisma from '../db/client';
import { dispatchWebhook } from '../services/webhookDispatcher';
import { getSettings } from '../services/settingService';
import { getSocket } from '../ws/socketHandler';

const router = Router();

router.get('/:chatId/messages', async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      where: { chatId: req.params.chatId },
      orderBy: { timestamp: 'asc' }
    });
    res.json(messages);
  } catch (err) {
    console.error(err); res.status(500).json({ error: "Internal error" });
  }
});

router.post('/:chatId/messages', async (req, res) => {
  try {
    const { text } = req.body;
    const chat = await prisma.chat.findUnique({ where: { id: req.params.chatId }, include: { contact: true } });
    if (!chat) return res.status(404).json({ error: "Chat not found" });

    const settings = await getSettings();
    const wamid = `wamid.HBgL${Math.random().toString(36).substring(2, 15)}`;
    
    const message = await prisma.message.create({
      data: {
        chatId: chat.id,
        wamid,
        direction: 'OUTBOUND',
        senderPhone: settings.phoneNumber,
        recipientPhone: chat.contact.phoneNumber,
        textBody: text,
        status: 'SENT'
      }
    });

    await prisma.chat.update({
      where: { id: chat.id },
      data: { lastMessageAt: new Date() }
    });

    getSocket().emit('message:received', message);
    
    // Fire and forget webhook
    dispatchWebhook(message, chat.contact).catch(err => {
      console.error('Webhook dispatch failed:', err);
    });
    
    res.json({ message, webhookDelivery: { pending: true } });
  } catch (err) {
    console.error(err); res.status(500).json({ error: "Internal error" });
  }
});

import { uploadAudio } from '../middleware/upload';

router.post('/:chatId/messages/audio', uploadAudio.single('audio'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No audio file provided" });

    const chat = await prisma.chat.findUnique({ where: { id: req.params.chatId as string }, include: { contact: true } });
    if (!chat) return res.status(404).json({ error: "Chat not found" });

    const settings = await getSettings();
    const wamid = `wamid.HBgL${Math.random().toString(36).substring(2, 15)}`;
    const mediaUrl = `/uploads/audio/${req.file.filename}`;
    
    const message = await prisma.message.create({
      data: {
        chatId: chat.id,
        wamid,
        direction: 'OUTBOUND',
        senderPhone: settings.phoneNumber,
        recipientPhone: chat.contact.phoneNumber,
        type: 'audio',
        mediaUrl: mediaUrl,
        status: 'SENT'
      }
    });

    await prisma.chat.update({
      where: { id: chat.id },
      data: { lastMessageAt: new Date() }
    });

    getSocket().emit('message:received', message);
    
    // Fire and forget webhook
    dispatchWebhook(message, chat.contact).catch(err => {
      console.error('Webhook dispatch failed:', err);
    });
    
    res.json({ message, webhookDelivery: { pending: true } });
  } catch (err) {
    console.error(err); res.status(500).json({ error: "Internal error" });
  }
});

export default router;
