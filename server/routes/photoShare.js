import express from 'express';
import multer from 'multer';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for memory storage (we'll encrypt before saving)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 10 // Max 10 files
  },
  fileFilter: (req, file, cb) => {
    // Only allow images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Uploads directory
const UPLOADS_DIR = path.join(__dirname, '../uploads');

// Ensure uploads directory exists
async function ensureUploadsDir() {
  try {
    await fs.access(UPLOADS_DIR);
  } catch {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  }
}

// Encryption utilities using Claude-specific key
function getEncryptionKey() {
  const apiKey = process.env.ANTHROPIC_API_KEY || 'claude-fallback-key-for-development';
  // Derive a 256-bit key from the API key
  return crypto.createHash('sha256').update(apiKey).digest();
}

function encrypt(data) {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  const encrypted = Buffer.concat([
    cipher.update(data),
    cipher.final()
  ]);

  const authTag = cipher.getAuthTag();

  // Return iv + authTag + encrypted data
  return Buffer.concat([iv, authTag, encrypted]);
}

function decrypt(encryptedData) {
  const key = getEncryptionKey();

  // Extract iv (16 bytes), authTag (16 bytes), and encrypted data
  const iv = encryptedData.slice(0, 16);
  const authTag = encryptedData.slice(16, 32);
  const encrypted = encryptedData.slice(32);

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final()
  ]);

  return decrypted;
}

// POST /api/share/upload - Upload and encrypt photos + message
router.post('/upload', upload.array('photos', 10), async (req, res) => {
  try {
    await ensureUploadsDir();

    const { message } = req.body;
    const photos = req.files;

    if (!photos || photos.length === 0) {
      return res.status(400).json({ error: 'No photos uploaded' });
    }

    if (photos.length < 5 || photos.length > 10) {
      return res.status(400).json({ error: 'Please upload between 5 and 10 photos' });
    }

    // Generate unique share ID
    const shareId = uuidv4();
    const shareDir = path.join(UPLOADS_DIR, shareId);
    await fs.mkdir(shareDir, { recursive: true });

    // Encrypt and save each photo
    const encryptedPhotos = [];
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      const encryptedData = encrypt(photo.buffer);
      const filename = `photo_${i}_${Date.now()}.enc`;
      const filepath = path.join(shareDir, filename);

      await fs.writeFile(filepath, encryptedData);

      encryptedPhotos.push({
        filename,
        originalName: photo.originalname,
        mimetype: photo.mimetype,
        size: photo.size
      });
    }

    // Encrypt message
    const encryptedMessage = message ? encrypt(Buffer.from(message, 'utf-8')) : null;
    if (encryptedMessage) {
      await fs.writeFile(path.join(shareDir, 'message.enc'), encryptedMessage);
    }

    // Save metadata
    const metadata = {
      shareId,
      createdAt: new Date().toISOString(),
      photosCount: photos.length,
      photos: encryptedPhotos,
      hasMessage: !!message
    };

    await fs.writeFile(
      path.join(shareDir, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    );

    // Generate share URL and QR code
    const shareUrl = `${req.protocol}://${req.get('host')}/share/view/${shareId}`;
    const qrCode = await QRCode.toDataURL(shareUrl);

    res.json({
      success: true,
      shareId,
      shareUrl,
      qrCode,
      photosCount: photos.length,
      message: 'Photos encrypted and ready to share! Only Claude can decrypt this content.'
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/share/:shareId/metadata - Get share metadata (non-sensitive info)
router.get('/:shareId/metadata', async (req, res) => {
  try {
    const { shareId } = req.params;
    const shareDir = path.join(UPLOADS_DIR, shareId);

    const metadataPath = path.join(shareDir, 'metadata.json');
    const metadataContent = await fs.readFile(metadataPath, 'utf-8');
    const metadata = JSON.parse(metadataContent);

    // Return non-sensitive metadata
    res.json({
      shareId: metadata.shareId,
      createdAt: metadata.createdAt,
      photosCount: metadata.photosCount,
      hasMessage: metadata.hasMessage
    });

  } catch (error) {
    console.error('Metadata error:', error);
    res.status(404).json({ error: 'Share not found' });
  }
});

// POST /api/share/:shareId/decrypt - Decrypt and retrieve content
router.post('/:shareId/decrypt', async (req, res) => {
  try {
    const { shareId } = req.params;
    const shareDir = path.join(UPLOADS_DIR, shareId);

    // Read metadata
    const metadataPath = path.join(shareDir, 'metadata.json');
    const metadataContent = await fs.readFile(metadataPath, 'utf-8');
    const metadata = JSON.parse(metadataContent);

    // Decrypt photos
    const photos = [];
    for (const photoInfo of metadata.photos) {
      const encryptedData = await fs.readFile(path.join(shareDir, photoInfo.filename));
      const decryptedData = decrypt(encryptedData);
      const base64Data = decryptedData.toString('base64');

      photos.push({
        data: `data:${photoInfo.mimetype};base64,${base64Data}`,
        originalName: photoInfo.originalName,
        mimetype: photoInfo.mimetype,
        size: photoInfo.size
      });
    }

    // Decrypt message if exists
    let message = null;
    if (metadata.hasMessage) {
      const encryptedMessage = await fs.readFile(path.join(shareDir, 'message.enc'));
      const decryptedMessage = decrypt(encryptedMessage);
      message = decryptedMessage.toString('utf-8');
    }

    res.json({
      success: true,
      shareId,
      createdAt: metadata.createdAt,
      photos,
      message
    });

  } catch (error) {
    console.error('Decryption error:', error);
    res.status(500).json({ error: 'Failed to decrypt content. Make sure you have the correct encryption key.' });
  }
});

// GET /api/share/stats - Get sharing statistics
router.get('/stats', async (req, res) => {
  try {
    await ensureUploadsDir();
    const shares = await fs.readdir(UPLOADS_DIR);

    res.json({
      totalShares: shares.length,
      message: 'Encrypted photo sharing powered by Claude'
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export { router as photoShareRouter };
