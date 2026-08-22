import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import dotenv from 'dotenv';
import { initSocket } from './ws/socketHandler';
import chatRouter from './routes/chats';
import messageRouter from './routes/messages';
import webhookLogsRouter from './routes/webhookLogs';
import whatsappRouter from './routes/whatsappCloudApi';

dotenv.config();

const app = express();
const httpServer = createServer(app);

import path from 'path';

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/chats', chatRouter);
app.use('/api/chats', messageRouter);
app.use('/api/webhook-logs', webhookLogsRouter);
app.use('/v22.0', whatsappRouter);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

initSocket(httpServer);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
