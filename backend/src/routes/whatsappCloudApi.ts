import { Router } from 'express';
import { handleIncomingApiMessage, markMessageRead } from '../services/chatService';
import prisma from '../db/client';

const router = Router();

router.get('/:media_id', async (req, res) => {
  try {
    const { media_id } = req.params;
    const message = await prisma.message.findUnique({ where: { id: media_id } });
    if (!message || !message.mediaUrl) {
      return res.status(404).json({ error: { message: "Media not found" } });
    }

    const host = req.get('host') || `localhost:${process.env.PORT || 3000}`;
    const url = `http://${host}${message.mediaUrl}`;

    return res.json({
      url,
      mime_type: 'audio/webm',
      sha256: 'fake-hash',
      file_size: 1024,
      id: media_id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { message: "Internal server error" } });
  }
});

router.post('/:phone_number_id/messages', async (req, res) => {
  try {
    const { phone_number_id } = req.params;
    const body = req.body;

    if (body.type === 'text' && body.text?.body) {
      const msg = await handleIncomingApiMessage(body.to, body.text.body);
      return res.json({
        messaging_product: "whatsapp",
        contacts: [{ input: body.to, wa_id: body.to }],
        messages: [{ id: msg.wamid }]
      });
    }

    if (body.status === 'read' && body.message_id) {
      await markMessageRead(body.message_id);
      return res.json({ success: true });
    }

    return res.status(400).json({ error: { message: "Unsupported message type" } });
  } catch (err) {
    console.error(err);
    console.error(err); res.status(500).json({ error: { message: "Internal server error" } });
  }
});

export default router;
