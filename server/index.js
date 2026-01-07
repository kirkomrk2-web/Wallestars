import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { claudeRouter } from './routes/claude.js';
import { computerUseRouter } from './routes/computerUse.js';
import { androidRouter } from './routes/android.js';
import { setupSocketHandlers } from './socket/handlers.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
// Configure allowed origins for CORS
const getAllowedOrigins = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.FRONTEND_URL;
  }
  // In development, allow localhost and network access
  return [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    // Allow any local network IP for development
    /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:5173$/,
    /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}:5173$/,
    /^http:\/\/172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}:5173$/
  ];
};

const io = new Server(httpServer, {
  cors: {
    origin: getAllowedOrigins(),
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('dist'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      claude: !!process.env.ANTHROPIC_API_KEY,
      computerUse: process.env.ENABLE_COMPUTER_USE === 'true',
      android: process.env.ENABLE_ANDROID === 'true'
    }
  });
});

// API Routes
app.use('/api/claude', claudeRouter);
app.use('/api/computer', computerUseRouter);
app.use('/api/android', androidRouter);

// Socket.IO setup
setupSocketHandlers(io);

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

httpServer.listen(PORT, HOST, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🌟 WALLESTARS CONTROL CENTER 🌟                    ║
║                                                       ║
║   Server running on: http://${HOST}:${PORT}            ║
║   WebSocket ready on: ws://${HOST}:${PORT}             ║
║                                                       ║
║   Services Status:                                    ║
║   ${process.env.ANTHROPIC_API_KEY ? '✅' : '❌'} Claude API                                ║
║   ${process.env.ENABLE_COMPUTER_USE === 'true' ? '✅' : '❌'} Computer Use (Linux)                     ║
║   ${process.env.ENABLE_ANDROID === 'true' ? '✅' : '❌'} Android Control                            ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
});

export { io };
