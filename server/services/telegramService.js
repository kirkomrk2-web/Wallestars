import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions/index.js';
import QRCode from 'qrcode';
import input from 'input';

class TelegramService {
  constructor() {
    this.client = null;
    this.session = null;
    this.apiId = parseInt(process.env.TELEGRAM_API_ID);
    this.apiHash = process.env.TELEGRAM_API_HASH;
    this.qrLoginData = null;
  }

  /**
   * Initialize Telegram client with string session
   * @param {string} sessionString - Optional existing session string
   */
  async initClient(sessionString = '') {
    try {
      this.session = new StringSession(sessionString);
      this.client = new TelegramClient(this.session, this.apiId, this.apiHash, {
        connectionRetries: 5,
      });

      await this.client.connect();
      console.log('Telegram client connected successfully');

      return {
        success: true,
        message: 'Client initialized'
      };
    } catch (error) {
      console.error('Error initializing Telegram client:', error);
      throw error;
    }
  }

  /**
   * Start QR code login flow
   * @returns {Object} QR code data including URL and image
   */
  async startQRLogin() {
    try {
      if (!this.client) {
        await this.initClient();
      }

      // Request QR code for login
      const qrLogin = await this.client.signInUserWithQrCode(
        { apiId: this.apiId, apiHash: this.apiHash },
        {
          onError: async (err) => {
            console.error('QR Login error:', err);
            throw err;
          },
          qrCode: async (code) => {
            // Store QR login data
            this.qrLoginData = code;
            console.log('QR Code token:', code.token.toString('hex'));
          },
          password: async () => {
            // Handle 2FA if needed
            return await input.text('Please enter your 2FA password: ');
          }
        }
      );

      // Wait a bit for QR data to be generated
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (!this.qrLoginData) {
        throw new Error('QR code data not generated');
      }

      // Generate QR code URL
      const qrUrl = `tg://login?token=${this.qrLoginData.token.toString('base64url')}`;

      // Generate QR code as base64 image
      const qrImage = await QRCode.toDataURL(qrUrl, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        width: 300,
        margin: 2
      });

      // Generate ASCII QR code for terminal
      const qrAscii = await QRCode.toString(qrUrl, {
        type: 'terminal',
        small: true
      });

      console.log('\n=== TELEGRAM QR CODE ===');
      console.log(qrAscii);
      console.log('========================\n');

      return {
        success: true,
        qrUrl,
        qrImage,
        qrAscii,
        expiresIn: 30 // QR codes typically expire in 30 seconds
      };

    } catch (error) {
      console.error('Error starting QR login:', error);
      throw error;
    }
  }

  /**
   * Check if QR code login was successful
   * @returns {Object} Login status and session string if successful
   */
  async checkQRLoginStatus() {
    try {
      if (!this.client) {
        return { success: false, loggedIn: false };
      }

      const isAuthorized = await this.client.isUserAuthorized();

      if (isAuthorized) {
        const user = await this.client.getMe();
        const sessionString = this.session.save();

        return {
          success: true,
          loggedIn: true,
          user: {
            id: user.id.toString(),
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            phone: user.phone
          },
          sessionString
        };
      }

      return {
        success: true,
        loggedIn: false
      };

    } catch (error) {
      console.error('Error checking login status:', error);
      return {
        success: false,
        loggedIn: false,
        error: error.message
      };
    }
  }

  /**
   * Login with existing session string
   * @param {string} sessionString - Saved session string
   */
  async loginWithSession(sessionString) {
    try {
      await this.initClient(sessionString);

      const isAuthorized = await this.client.isUserAuthorized();

      if (!isAuthorized) {
        throw new Error('Session is invalid or expired');
      }

      const user = await this.client.getMe();

      return {
        success: true,
        user: {
          id: user.id.toString(),
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          phone: user.phone
        }
      };

    } catch (error) {
      console.error('Error logging in with session:', error);
      throw error;
    }
  }

  /**
   * Get saved messages from Telegram
   * @param {number} limit - Number of messages to fetch
   * @param {number} offset - Offset for pagination
   * @returns {Array} Array of saved messages
   */
  async getSavedMessages(limit = 100, offset = 0) {
    try {
      if (!this.client) {
        throw new Error('Client not initialized');
      }

      const isAuthorized = await this.client.isUserAuthorized();
      if (!isAuthorized) {
        throw new Error('User not authorized');
      }

      // Get saved messages (messages to self)
      const messages = await this.client.getMessages('me', {
        limit,
        offsetId: offset,
      });

      // Parse and format messages
      const formattedMessages = messages.map(msg => ({
        id: msg.id,
        date: msg.date,
        message: msg.message,
        media: msg.media ? {
          type: msg.media.className,
          hasDocument: !!msg.media.document,
          hasPhoto: !!msg.media.photo,
          hasVideo: !!msg.media.video,
        } : null,
        fromId: msg.fromId?.userId?.toString() || 'me',
        replyTo: msg.replyTo?.replyToMsgId || null,
        views: msg.views || 0,
        forwards: msg.forwards || 0,
        reactions: msg.reactions?.results || []
      }));

      return {
        success: true,
        messages: formattedMessages,
        count: formattedMessages.length
      };

    } catch (error) {
      console.error('Error getting saved messages:', error);
      throw error;
    }
  }

  /**
   * Analyze saved messages and extract statistics
   * @param {number} limit - Number of messages to analyze
   * @returns {Object} Analysis results
   */
  async analyzeSavedMessages(limit = 500) {
    try {
      const result = await this.getSavedMessages(limit);
      const messages = result.messages;

      // Analyze messages
      const stats = {
        totalMessages: messages.length,
        textMessages: 0,
        mediaMessages: 0,
        linksCount: 0,
        wordCount: 0,
        averageMessageLength: 0,
        messagesByDate: {},
        mediaTypes: {},
        topWords: {},
        links: []
      };

      messages.forEach(msg => {
        // Count message types
        if (msg.message) {
          stats.textMessages++;
          stats.wordCount += msg.message.split(/\s+/).length;

          // Extract links
          const urlRegex = /(https?:\/\/[^\s]+)/g;
          const links = msg.message.match(urlRegex) || [];
          stats.linksCount += links.length;
          stats.links.push(...links);

          // Count words (simple analysis)
          const words = msg.message.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(w => w.length > 3);

          words.forEach(word => {
            stats.topWords[word] = (stats.topWords[word] || 0) + 1;
          });
        }

        if (msg.media) {
          stats.mediaMessages++;
          const mediaType = msg.media.type || 'unknown';
          stats.mediaTypes[mediaType] = (stats.mediaTypes[mediaType] || 0) + 1;
        }

        // Group by date
        const dateKey = new Date(msg.date * 1000).toISOString().split('T')[0];
        stats.messagesByDate[dateKey] = (stats.messagesByDate[dateKey] || 0) + 1;
      });

      // Calculate averages
      stats.averageMessageLength = stats.textMessages > 0
        ? Math.round(stats.wordCount / stats.textMessages)
        : 0;

      // Get top 20 words
      const topWordsArray = Object.entries(stats.topWords)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([word, count]) => ({ word, count }));

      stats.topWords = topWordsArray;

      // Get unique links
      stats.links = [...new Set(stats.links)].slice(0, 50);

      return {
        success: true,
        stats
      };

    } catch (error) {
      console.error('Error analyzing saved messages:', error);
      throw error;
    }
  }

  /**
   * Search saved messages
   * @param {string} query - Search query
   * @param {number} limit - Number of results
   */
  async searchSavedMessages(query, limit = 50) {
    try {
      if (!this.client) {
        throw new Error('Client not initialized');
      }

      const messages = await this.client.getMessages('me', {
        limit,
        search: query
      });

      const formattedMessages = messages.map(msg => ({
        id: msg.id,
        date: msg.date,
        message: msg.message,
        media: msg.media ? { type: msg.media.className } : null
      }));

      return {
        success: true,
        messages: formattedMessages,
        count: formattedMessages.length
      };

    } catch (error) {
      console.error('Error searching saved messages:', error);
      throw error;
    }
  }

  /**
   * Logout and clear session
   */
  async logout() {
    try {
      if (this.client) {
        await this.client.invoke({ _: 'auth.logOut' });
        await this.client.disconnect();
        this.client = null;
        this.session = null;
        this.qrLoginData = null;
      }

      return {
        success: true,
        message: 'Logged out successfully'
      };

    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  }

  /**
   * Get current user info
   */
  async getCurrentUser() {
    try {
      if (!this.client) {
        throw new Error('Client not initialized');
      }

      const isAuthorized = await this.client.isUserAuthorized();
      if (!isAuthorized) {
        throw new Error('User not authorized');
      }

      const user = await this.client.getMe();

      return {
        success: true,
        user: {
          id: user.id.toString(),
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          phone: user.phone,
          premium: user.premium || false
        }
      };

    } catch (error) {
      console.error('Error getting current user:', error);
      throw error;
    }
  }
}

// Create singleton instance
const telegramService = new TelegramService();

export default telegramService;
