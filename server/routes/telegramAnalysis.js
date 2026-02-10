import express from 'express';
import TelegramMessageAnalyzer from '../services/telegramAnalyzer.js';
import telegramService from '../services/telegramService.js';

const router = express.Router();

// Initialize analyzer
let analyzer;
if (process.env.ANTHROPIC_API_KEY) {
  analyzer = new TelegramMessageAnalyzer(process.env.ANTHROPIC_API_KEY);
}

/**
 * POST /api/telegram/analyze/message
 * Analyze a single message with AI
 */
router.post('/message', async (req, res) => {
  try {
    if (!analyzer) {
      return res.status(503).json({
        success: false,
        error: 'AI analyzer not configured. Set ANTHROPIC_API_KEY.'
      });
    }

    const { message, analysisTypes } = req.body;

    if (!message || !message.message) {
      return res.status(400).json({
        success: false,
        error: 'Message object with text required'
      });
    }

    const analysis = await analyzer.analyzeMessage(message, analysisTypes);

    res.json({
      success: true,
      messageId: message.id,
      analysis
    });

  } catch (error) {
    console.error('Message analysis error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/telegram/analyze/batch
 * Analyze multiple messages
 */
router.post('/batch', async (req, res) => {
  try {
    if (!analyzer) {
      return res.status(503).json({
        success: false,
        error: 'AI analyzer not configured'
      });
    }

    const { messages, analysisTypes, batchSize } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        success: false,
        error: 'Messages array required'
      });
    }

    const result = await analyzer.analyzeMessages(messages, {
      analysisTypes,
      batchSize: batchSize || 10,
      includeStats: true
    });

    res.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('Batch analysis error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/telegram/analyze/saved-messages
 * Analyze user's saved messages from Telegram
 */
router.post('/saved-messages', async (req, res) => {
  try {
    if (!analyzer) {
      return res.status(503).json({
        success: false,
        error: 'AI analyzer not configured'
      });
    }

    const { limit = 100, analysisTypes } = req.body;

    // Get saved messages from Telegram
    const messagesResult = await telegramService.getSavedMessages(limit);

    if (!messagesResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Failed to fetch saved messages'
      });
    }

    // Analyze the messages
    const analysis = await analyzer.analyzeMessages(messagesResult.messages, {
      analysisTypes: analysisTypes || ['sentiment', 'category'],
      batchSize: 10,
      includeStats: true
    });

    res.json({
      success: true,
      totalMessages: messagesResult.count,
      analyzed: analysis.messages.length,
      ...analysis
    });

  } catch (error) {
    console.error('Saved messages analysis error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/telegram/analyze/conversation
 * Analyze a conversation thread
 */
router.post('/conversation', async (req, res) => {
  try {
    if (!analyzer) {
      return res.status(503).json({
        success: false,
        error: 'AI analyzer not configured'
      });
    }

    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Messages array with at least one message required'
      });
    }

    const analysis = await analyzer.analyzeConversationThread(messages);

    res.json({
      success: true,
      messageCount: messages.length,
      analysis
    });

  } catch (error) {
    console.error('Conversation analysis error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/telegram/analyze/smart-search
 * Semantic search across messages
 */
router.post('/smart-search', async (req, res) => {
  try {
    if (!analyzer) {
      return res.status(503).json({
        success: false,
        error: 'AI analyzer not configured'
      });
    }

    const { query, limit = 100 } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Search query required'
      });
    }

    // Get saved messages
    const messagesResult = await telegramService.getSavedMessages(limit);

    if (!messagesResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Failed to fetch messages'
      });
    }

    // Perform smart search
    const searchResults = await analyzer.smartSearch(messagesResult.messages, query);

    res.json({
      success: true,
      query,
      searchedMessages: messagesResult.count,
      ...searchResults
    });

  } catch (error) {
    console.error('Smart search error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/telegram/analyze/insights
 * Generate insights from messages
 */
router.post('/insights', async (req, res) => {
  try {
    if (!analyzer) {
      return res.status(503).json({
        success: false,
        error: 'AI analyzer not configured'
      });
    }

    const { limit = 500 } = req.body;

    // Get saved messages
    const messagesResult = await telegramService.getSavedMessages(limit);

    if (!messagesResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Failed to fetch messages'
      });
    }

    // Generate insights
    const insights = await analyzer.generateInsights(messagesResult.messages);

    res.json({
      success: true,
      analyzedMessages: messagesResult.count,
      insights
    });

  } catch (error) {
    console.error('Insights generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/telegram/analyze/health
 * Check analyzer health
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    analyzerAvailable: !!analyzer,
    anthropicConfigured: !!process.env.ANTHROPIC_API_KEY,
    features: [
      'sentiment analysis',
      'message categorization',
      'entity extraction',
      'summarization',
      'action item extraction',
      'conversation analysis',
      'smart search',
      'insights generation'
    ]
  });
});

export default router;
