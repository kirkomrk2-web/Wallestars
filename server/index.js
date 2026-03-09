import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';
import dotenv from 'dotenv';
import { claudeRouter } from './routes/claude.js';
import { computerUseRouter } from './routes/computerUse.js';
import { androidRouter } from './routes/android.js';
import { documentScannerRouter } from './routes/documentScanner.js';
import { n8nWebhooksRouter } from './routes/n8nWebhooks.js';
import { sseRouter } from './routes/sse.js';
import { hostingerRouter } from './routes/hostinger.js';
import { orchestrationRouter } from './routes/orchestration.js';
import { logsRouter } from './routes/logs.js';
import { setupSocketHandlers } from './socket/handlers.js';
import { authMiddleware } from './middleware/auth.js';

// New integrations
import { airtopRouter } from './routes/airtop.js';
import { gitlabRouter } from './routes/gitlab.js';
import { slackRouter } from './routes/slack.js';
import { discordRouter } from './routes/discord.js';
import { openaiRouter } from './routes/openai.js';
import { notionRouter } from './routes/notion.js';
import { twilioRouter } from './routes/twilio.js';
import { sendgridRouter } from './routes/sendgrid.js';
import { jiraRouter } from './routes/jira.js';
import { linearRouter } from './routes/linear.js';
import { vercelRouter } from './routes/vercel.js';
import { replicateRouter } from './routes/replicate.js';
import { wallesterRouter } from './routes/wallester.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../dist');

// Startup Validation
if (!process.env.ANTHROPIC_API_KEY) {
  console.warn('⚠️ WARNING: ANTHROPIC_API_KEY is not set. Claude AI features and Admin access via sk-ant- keys will be disabled.');
}
if (!process.env.WALLESTARS_API_KEY) {
  console.warn('⚠️ WARNING: WALLESTARS_API_KEY is not set. External agents using ws- keys will not be able to authenticate.');
}

const app = express();
const httpServer = createServer(app);

const allowedWsOrigins = process.env.NODE_ENV === 'production'
  ? (process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : true)
  : ['http://localhost:5173', 'http://localhost:3006'];

const io = new Server(httpServer, {
  cors: {
    origin: allowedWsOrigins,
    methods: ['GET', 'POST']
  }
});

// Middleware
app.set('trust proxy', 1); // Trust first proxy (Nginx/Traefik)
const corsOrigin = process.env.NODE_ENV === 'production'
  ? (process.env.FRONTEND_URL || process.env.ALLOWED_ORIGIN || false)
  : '*';
app.use(cors({
  origin: corsOrigin,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('dev')); // HTTP request logging
app.use(express.json());
app.use(express.static(distPath));

// Rate limiting
// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 2000, // Limit each IP to 2000 requests per `window` (here, per 15 minutes)
  standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
const spaFallbackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5000,
  standardHeaders: 'draft-7',
  legacyHeaders: false
});
app.use('/api/', limiter);
// Authentication Middleware
app.use('/api', authMiddleware);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      claude: !!process.env.ANTHROPIC_API_KEY,
      computerUse: process.env.ENABLE_COMPUTER_USE === 'true',
      android: process.env.ENABLE_ANDROID === 'true',
      documentScanner: !!process.env.ANTHROPIC_API_KEY,
      hostinger: !!process.env.HOSTINGER_API_TOKEN,
      orchestration: true,
      // New integrations
      airtop: !!process.env.AIRTOP_API_KEY,
      gitlab: !!process.env.GITLAB_API_TOKEN,
      slack: !!process.env.SLACK_BOT_TOKEN,
      discord: !!process.env.DISCORD_BOT_TOKEN,
      openai: !!process.env.OPENAI_API_KEY,
      notion: !!process.env.NOTION_API_KEY,
      twilio: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
      sendgrid: !!process.env.SENDGRID_API_KEY,
      jira: !!(process.env.JIRA_BASE_URL && process.env.JIRA_API_TOKEN),
      linear: !!process.env.LINEAR_API_KEY,
      vercel: !!process.env.VERCEL_API_TOKEN,
      replicate: !!process.env.REPLICATE_API_TOKEN
    }
  });
});

// API Routes
app.use('/api/claude', claudeRouter);
app.use('/api/computer', computerUseRouter);
app.use('/api/android', androidRouter);
app.use('/api/document-scanner', documentScannerRouter);
app.use('/api/webhooks/n8n', n8nWebhooksRouter);
app.use('/api/hostinger', hostingerRouter);
app.use('/api/orchestration', orchestrationRouter);

// New integration routes
app.use('/api/airtop', airtopRouter);
app.use('/api/gitlab', gitlabRouter);
app.use('/api/slack', slackRouter);
app.use('/api/discord', discordRouter);
app.use('/api/openai', openaiRouter);
app.use('/api/notion', notionRouter);
app.use('/api/twilio', twilioRouter);
app.use('/api/sendgrid', sendgridRouter);
app.use('/api/jira', jiraRouter);
app.use('/api/linear', linearRouter);
app.use('/api/vercel', vercelRouter);
app.use('/api/replicate', replicateRouter);
app.use('/api/wallester', wallesterRouter);
app.use('/api/logs', logsRouter);

// SSE Route for MCP SuperAssistant
app.use('/sse', sseRouter);

// Catch-all for SPA (must be after API routes)
app.get('*', spaFallbackLimiter, (req, res) => {
  // Don't intercept API calls that might have missed their route
  if (req.path.startsWith('/api/') || req.path.startsWith('/sse')) {
    return res.status(404).json({ error: 'Not Found' });
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

// Socket.IO setup
setupSocketHandlers(io);

// Make io globally available for n8n webhooks
global.io = io;

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🌟 WALLESTARS NEXUS CONTROL CENTER 🌟              ║
║                                                       ║
║   Server running on: http://localhost:${PORT}         ║
║   WebSocket ready on: ws://localhost:${PORT}          ║
║   SSE endpoint on:    http://localhost:${PORT}/sse    ║
║                                                       ║
║   Features enabled:                                   ║
║   - Claude AI Assistant                              ║
║   - MCP SSE Integration                              ║
║   - AI Agent Orchestration Farm                      ║
║   - Hostinger VPS Management                         ║
║                                                       ║
║   Security:                                           ║
║   ${process.env.WALLESTARS_API_KEY ? '✅' : '⚠️'} Agent Auth (WALLESTARS_API_KEY)              ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
});

export { app, httpServer, io };
