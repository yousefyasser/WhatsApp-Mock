import { Router } from 'express';
import prisma from '../db/client';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const chats = await prisma.chat.findMany({
      include: { contact: true, messages: { orderBy: { timestamp: 'desc' }, take: 1 } },
      orderBy: { lastMessageAt: 'desc' }
    });
    res.json(chats);
  } catch (err) {
    console.error(err); res.status(500).json({ error: "Internal error" });
  }
});

router.post('/', async (req, res) => {
  try {
    const { phoneNumber, name, webhookUrl, accessToken } = req.body;
    let contact = await prisma.contact.findUnique({ where: { phoneNumber } });
    if (!contact) {
      contact = await prisma.contact.create({ data: { phoneNumber, name } });
    }
    let chat = await prisma.chat.findUnique({ where: { contactId: contact.id } });
    if (!chat) {
      chat = await prisma.chat.create({ 
        data: { contactId: contact.id, webhookUrl, accessToken }, 
        include: { contact: true } 
      });
    } else if (webhookUrl || accessToken) {
      chat = await prisma.chat.update({
        where: { id: chat.id },
        data: {
          ...(webhookUrl && { webhookUrl }),
          ...(accessToken && { accessToken })
        },
        include: { contact: true }
      });
    } else {
      chat = await prisma.chat.findUniqueOrThrow({ where: { id: chat.id }, include: { contact: true } });
    }
    res.json(chat);
  } catch (err) {
    console.error(err); res.status(500).json({ error: "Internal error" });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { webhookUrl, accessToken } = req.body;
    const chat = await prisma.chat.update({
      where: { id },
      data: {
        ...(webhookUrl && { webhookUrl }),
        ...(accessToken && { accessToken })
      },
      include: { contact: true }
    });
    res.json(chat);
  } catch (err) {
    console.error(err); res.status(500).json({ error: "Internal error" });
  }
});

export default router;
