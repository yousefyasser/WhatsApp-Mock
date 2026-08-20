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
    const { phoneNumber, name } = req.body;
    let contact = await prisma.contact.findUnique({ where: { phoneNumber } });
    if (!contact) {
      contact = await prisma.contact.create({ data: { phoneNumber, name } });
    }
    let chat = await prisma.chat.findUnique({ where: { contactId: contact.id } });
    if (!chat) {
      chat = await prisma.chat.create({ data: { contactId: contact.id }, include: { contact: true } });
    } else {
      chat = await prisma.chat.findUniqueOrThrow({ where: { id: chat.id }, include: { contact: true } });
    }
    res.json(chat);
  } catch (err) {
    console.error(err); res.status(500).json({ error: "Internal error" });
  }
});

export default router;
