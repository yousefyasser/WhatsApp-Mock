import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import { getMediaTypeFromMime, MEDIA_LIMITS } from '../services/mediaService';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const mediaType = getMediaTypeFromMime(file.mimetype) || 'document';
    const dir = path.join(__dirname, '../../uploads/media', mediaType);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'media-' + uniqueSuffix + '-' + file.originalname);
  }
});

// We set the generic limit to the maximum possible (100MB), 
// and we'll do specific per-type limits in the route handler or a middleware wrapper
export const uploadMedia = multer({ 
  storage,
  limits: { fileSize: MEDIA_LIMITS.document }
});

// Keep uploadAudio for backwards compatibility if needed during transition
const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/audio'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'audio-' + uniqueSuffix + '.webm');
  }
});
export const uploadAudio = multer({ storage: audioStorage });
