import express from 'express';
import telegramService from '../services/telegramService.js';

const router = express.Router();

/**
 * POST /api/telegram/qr-login/start
 * Start QR code login flow
 */
router.post('/qr-login/start', async (req, res) => {
  try {
    const result = await telegramService.startQRLogin();
    res.json(result);
  } catch (error) {
    console.error('QR login start error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/telegram/qr-login/status
 * Check QR code login status
 */
router.get('/qr-login/status', async (req, res) => {
  try {
    const result = await telegramService.checkQRLoginStatus();
    res.json(result);
  } catch (error) {
    console.error('QR login status error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/telegram/login/session
 * Login with existing session string
 */
router.post('/login/session', async (req, res) => {
  try {
    const { sessionString } = req.body;

    if (!sessionString) {
      return res.status(400).json({
        success: false,
        error: 'Session string is required'
      });
    }

    const result = await telegramService.loginWithSession(sessionString);
    res.json(result);
  } catch (error) {
    console.error('Session login error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/telegram/user/me
 * Get current user info
 */
router.get('/user/me', async (req, res) => {
  try {
    const result = await telegramService.getCurrentUser();
    res.json(result);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/telegram/messages/saved
 * Get saved messages
 * Query params: limit (default 100), offset (default 0)
 */
router.get('/messages/saved', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;

    const result = await telegramService.getSavedMessages(limit, offset);
    res.json(result);
  } catch (error) {
    console.error('Get saved messages error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/telegram/messages/analyze
 * Analyze saved messages
 * Query params: limit (default 500)
 */
router.get('/messages/analyze', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 500;

    const result = await telegramService.analyzeSavedMessages(limit);
    res.json(result);
  } catch (error) {
    console.error('Analyze messages error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/telegram/messages/search
 * Search saved messages
 * Query params: q (query), limit (default 50)
 */
router.get('/messages/search', async (req, res) => {
  try {
    const query = req.query.q;
    const limit = parseInt(req.query.limit) || 50;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    const result = await telegramService.searchSavedMessages(query, limit);
    res.json(result);
  } catch (error) {
    console.error('Search messages error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/telegram/logout
 * Logout and clear session
 */
router.post('/logout', async (req, res) => {
  try {
    const result = await telegramService.logout();
    res.json(result);
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/telegram/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Telegram service is running',
    apiId: !!process.env.TELEGRAM_API_ID,
    apiHash: !!process.env.TELEGRAM_API_HASH
  });
});

export default router;
