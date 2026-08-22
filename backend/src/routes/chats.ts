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
    const { 
      contactPhone, 
      name, 
      webhookUrl, 
      accessToken,
      phoneNumber,
      displayName,
      phoneNumberId,
      wabaId,
      webhookVerifyToken,
      tags,
      backgroundColor
    } = req.body;
    
    // For backward compatibility or if frontend still sends phoneNumber as contactPhone
    const actualContactPhone = contactPhone;

    let contact = await prisma.contact.findUnique({ where: { phoneNumber: actualContactPhone } });
    if (!contact) {
      contact = await prisma.contact.create({ data: { phoneNumber: actualContactPhone, name } });
    }
    
    let chat = await prisma.chat.findUnique({ where: { contactId: contact.id } });
    const chatData = {
      ...(webhookUrl !== undefined && { webhookUrl }),
      ...(accessToken !== undefined && { accessToken }),
      ...(phoneNumber !== undefined && { phoneNumber }), // WABA phone number
      ...(displayName !== undefined && { displayName }),
      ...(phoneNumberId !== undefined && { phoneNumberId }),
      ...(wabaId !== undefined && { wabaId }),
      ...(webhookVerifyToken !== undefined && { webhookVerifyToken }),
      ...(tags !== undefined && { tags }),
      ...(backgroundColor !== undefined && { backgroundColor })
    };

    if (!chat) {
      chat = await prisma.chat.create({ 
        data: { contactId: contact.id, ...chatData }, 
        include: { contact: true } 
      });
    } else {
      chat = await prisma.chat.update({
        where: { id: chat.id },
        data: chatData,
        include: { contact: true }
      });
    }
    res.json(chat);
  } catch (err) {
    console.error(err); res.status(500).json({ error: "Internal error" });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      webhookUrl, 
      accessToken,
      phoneNumber,
      displayName,
      phoneNumberId,
      wabaId,
      webhookVerifyToken,
      tags,
      backgroundColor,
      contactPhone
    } = req.body;

    let chat = await prisma.chat.findUnique({ where: { id }, include: { contact: true } });
    if (!chat) return res.status(404).json({ error: "Chat not found" });

    if (contactPhone && contactPhone !== chat.contact?.phoneNumber) {
      // update contact phone
      await prisma.contact.update({
        where: { id: chat.contactId },
        data: { phoneNumber: contactPhone, name: contactPhone }
      });
    }

    const updatedChat = await prisma.chat.update({
      where: { id },
      data: {
        ...(webhookUrl !== undefined && { webhookUrl }),
        ...(accessToken !== undefined && { accessToken }),
        ...(phoneNumber !== undefined && { phoneNumber }),
        ...(displayName !== undefined && { displayName }),
        ...(phoneNumberId !== undefined && { phoneNumberId }),
        ...(wabaId !== undefined && { wabaId }),
        ...(webhookVerifyToken !== undefined && { webhookVerifyToken }),
        ...(tags !== undefined && { tags }),
        ...(backgroundColor !== undefined && { backgroundColor })
      },
      include: { contact: true }
    });
    res.json(updatedChat);
  } catch (err) {
    console.error(err); res.status(500).json({ error: "Internal error" });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.chat.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error(err); res.status(500).json({ error: "Internal error" });
  }
});

export default router;
