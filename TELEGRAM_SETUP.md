# Telegram Saved Messages Analyzer - Setup Guide

## Overview

The Telegram Saved Messages Analyzer allows you to:
- **Login with QR Code**: Securely authenticate using your Telegram mobile app
- **View Saved Messages**: Browse all your Telegram saved messages
- **Analyze Messages**: Get detailed statistics about your saved messages
- **Search Messages**: Find specific messages quickly

## Prerequisites

1. A Telegram account
2. Telegram mobile app installed on your phone
3. Telegram API credentials (API ID and API Hash)

## Getting Your Telegram API Credentials

### Step 1: Visit Telegram API Development Tools

1. Go to [https://my.telegram.org](https://my.telegram.org)
2. Log in with your phone number (you'll receive a code via Telegram)

### Step 2: Create a New Application

1. Click on **"API development tools"**
2. Fill in the application form:
   - **App title**: `Wallestars Control Center` (or any name)
   - **Short name**: `wallestars` (or any short name)
   - **URL**: `http://localhost:3000` (optional)
   - **Platform**: Choose `Desktop`
   - **Description**: Brief description of your app (optional)

3. Click **"Create application"**

### Step 3: Save Your Credentials

You will receive two important values:
- **api_id**: A numeric value (e.g., `12345678`)
- **api_hash**: A string of letters and numbers (e.g., `abcdef1234567890abcdef1234567890`)

⚠️ **IMPORTANT**: Keep these credentials secure! Never share them publicly.

## Configuration

### 1. Update Your `.env` File

Copy your API credentials to the `.env` file:

```bash
# Telegram API Configuration
TELEGRAM_API_ID=12345678
TELEGRAM_API_HASH=abcdef1234567890abcdef1234567890
```

### 2. Restart the Server

After adding the credentials, restart the Wallestars server:

```bash
npm run dev
```

You should see the Telegram service status in the server startup message:
```
✅ Telegram Integration
```

## Using the Telegram Features

### 1. QR Code Login

1. Navigate to **"Telegram Login"** in the sidebar
2. Click **"Generate QR Code"**
3. Open Telegram on your mobile device
4. Go to **Settings → Devices → Scan QR Code**
5. Scan the displayed QR code
6. Confirm the login on your phone

The QR code expires after 30 seconds. If it expires, click "Generate New Code".

### 2. Session Management

After your first login, your session is saved securely in your browser's localStorage. On subsequent visits:

- If you have a saved session, you can click **"Login with Saved Session"** for instant access
- No need to scan the QR code again unless you logout or the session expires

### 3. Viewing Saved Messages

1. After logging in, navigate to **"Saved Messages"** in the sidebar
2. View your recent saved messages
3. Use the dropdown to load more messages (50, 100, 200, or 500)

### 4. Analyzing Messages

Click the **"Run Analysis"** button or navigate to the **Analytics** tab to:
- See total message count (text vs media)
- View word frequency analysis
- Find all links saved in your messages
- See media type breakdown
- View messages by date

### 5. Searching Messages

1. Go to the **Search** tab
2. Enter your search query
3. Click **"Search"** to find matching messages
4. Results show message content, date, and media type

## Features

### Supported Message Types

- ✅ Text messages
- ✅ Photos
- ✅ Videos
- ✅ Documents
- ✅ Links
- ✅ Media with captions

### Analytics

- **Total message count**: Total saved messages analyzed
- **Text vs Media**: Breakdown of message types
- **Word frequency**: Top 20 most used words (4+ characters)
- **Link extraction**: All unique links found in messages
- **Media types**: Breakdown by photo, video, document, etc.
- **Average message length**: Words per text message

### Search

- Fast keyword search across all saved messages
- Search in message text content
- Results include date and media information

## Security & Privacy

### Session Storage

- Sessions are stored in your browser's localStorage
- Session strings are encrypted by the Telegram MTProto protocol
- Sessions persist between browser sessions
- You can logout at any time to clear the session

### Data Privacy

- All data stays on your local machine
- No messages are stored on external servers
- Analysis is performed in real-time
- Your Telegram API credentials are stored in `.env` (never commit this file!)

## Troubleshooting

### QR Code Not Generating

**Issue**: Clicking "Generate QR Code" shows an error

**Solutions**:
1. Check that `TELEGRAM_API_ID` and `TELEGRAM_API_HASH` are set in `.env`
2. Verify the credentials are correct (no extra spaces or quotes)
3. Restart the server after adding credentials
4. Check the browser console for error messages

### Login Not Working

**Issue**: Scanned QR code but not logged in

**Solutions**:
1. Make sure you confirmed the login on your phone
2. The QR code expires after 30 seconds - generate a new one
3. Check your internet connection
4. Try logging out and generating a new QR code

### Session Expired

**Issue**: "Session is invalid or expired" error

**Solutions**:
1. Clear your browser's localStorage
2. Use QR code login to create a new session
3. Make sure you're logged in to Telegram on your phone

### Messages Not Loading

**Issue**: Saved messages not appearing

**Solutions**:
1. Verify you're logged in (check for green checkmark)
2. Make sure you have saved messages in Telegram
3. Check browser console for API errors
4. Try refreshing the page

## API Endpoints

The Telegram integration exposes these endpoints:

- `POST /api/telegram/qr-login/start` - Generate QR code
- `GET /api/telegram/qr-login/status` - Check login status
- `POST /api/telegram/login/session` - Login with saved session
- `GET /api/telegram/user/me` - Get current user info
- `GET /api/telegram/messages/saved` - Get saved messages
- `GET /api/telegram/messages/analyze` - Analyze messages
- `GET /api/telegram/messages/search` - Search messages
- `POST /api/telegram/logout` - Logout and clear session
- `GET /api/telegram/health` - Health check

## Rate Limits

Telegram has rate limits to prevent abuse:
- **QR Code generation**: ~20 codes per hour
- **Message fetching**: ~100 requests per minute
- **API calls**: Varies by method

If you encounter rate limit errors, wait a few minutes before trying again.

## Advanced Configuration

### Custom Message Limit

By default, analysis processes 500 messages. To analyze more:

```javascript
// In TelegramSavedMessages.jsx, modify the analyzeMessages call:
analyzeMessages(1000) // Analyze 1000 messages instead of 500
```

### Session Persistence

Sessions are stored in localStorage by default. For enhanced security:

1. Store sessions server-side in a database
2. Implement session encryption
3. Add session expiration policies

## Support

For issues or questions:
1. Check this documentation first
2. Review the browser console for errors
3. Check server logs for backend errors
4. Open an issue in the project repository

## Security Notes

⚠️ **NEVER**:
- Share your API credentials publicly
- Commit `.env` file to version control
- Use API credentials in client-side code
- Share your session string with others

✅ **ALWAYS**:
- Keep API credentials in `.env` file
- Add `.env` to `.gitignore`
- Use secure HTTPS in production
- Logout from untrusted devices

## License

This feature is part of the Wallestars Control Center project.
