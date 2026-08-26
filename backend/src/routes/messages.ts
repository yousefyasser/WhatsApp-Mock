import { Router } from 'express';
import prisma from '../db/client';
import { dispatchWebhook } from '../services/webhookDispatcher';
import { getSocket } from '../ws/socketHandler';
import { uploadMedia, uploadAudio } from '../middleware/upload';
import { createMedia } from '../services/mediaService';

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

    const wamid = `wamid.HBgL${Math.random().toString(36).substring(2, 15)}`;
    
    const message = await prisma.message.create({
      data: {
        chatId: chat.id,
        wamid,
        direction: 'OUTBOUND',
        senderPhone: chat.phoneNumber,
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

router.post('/:chatId/messages/audio', uploadMedia.single('audio'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No audio file provided" });

    const chat = await prisma.chat.findUnique({ where: { id: req.params.chatId as string }, include: { contact: true } });
    if (!chat) return res.status(404).json({ error: "Chat not found" });

    // Create a proper Media record — same pipeline as images/documents
    const media = await createMedia(req.file, 'audio');

    const wamid = `wamid.HBgL${Math.random().toString(36).substring(2, 15)}`;
    
    const message = await prisma.message.create({
      data: {
        chatId: chat.id,
        wamid,
        direction: 'OUTBOUND',
        senderPhone: chat.phoneNumber,
        recipientPhone: chat.contact.phoneNumber,
        type: 'audio',
        mediaId: media.id,
        mediaUrl: media.storagePath,
        status: 'SENT'
      },
      include: { media: true }
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

router.post('/:chatId/messages/media', async (req, res) => {
  try {
    const { type, [type]: mediaPayload } = req.body;
    const chat = await prisma.chat.findUnique({ where: { id: req.params.chatId }, include: { contact: true } });
    if (!chat) return res.status(404).json({ error: "Chat not found" });

    let mediaId = undefined;
    let mediaLink = undefined;
    let mediaUrl = undefined;
    
    if (mediaPayload?.id) {
      mediaId = mediaPayload.id;
      const media = await prisma.media.findUnique({ where: { id: mediaId } });
      if (media) mediaUrl = media.storagePath;
    } else if (mediaPayload?.link) {
      mediaLink = mediaPayload.link;
      mediaUrl = mediaLink;
    } else {
      return res.status(400).json({ error: "No media id or link provided" });
    }

    const wamid = `wamid.HBgL${Math.random().toString(36).substring(2, 15)}`;
    
    const message = await prisma.message.create({
      data: {
        chatId: chat.id,
        wamid,
        direction: 'OUTBOUND',
        senderPhone: chat.phoneNumber,
        recipientPhone: chat.contact.phoneNumber,
        type: type || 'document',
        mediaId,
        mediaLink,
        mediaUrl,
        mediaCaption: mediaPayload.caption,
        mediaFilename: mediaPayload.filename,
        status: 'SENT'
      },
      include: { media: true }
    });

    await prisma.chat.update({
      where: { id: chat.id },
      data: { lastMessageAt: new Date() }
    });

    getSocket().emit('message:received', message);
    
    dispatchWebhook(message, chat.contact).catch(err => console.error('Webhook dispatch failed:', err));
    
    res.json({ message, webhookDelivery: { pending: true } });
  } catch (err) {
    console.error(err); res.status(500).json({ error: "Internal error" });
  }
});

export default router;
