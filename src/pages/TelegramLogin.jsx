import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Send,
  QrCode,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  LogOut,
  User,
  Phone,
  Shield,
  Loader2,
  ExternalLink
} from 'lucide-react';

export default function TelegramLogin() {
  const [loginState, setLoginState] = useState('initial'); // initial, qr-loading, qr-ready, checking, logged-in
  const [qrData, setQrData] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [sessionString, setSessionString] = useState('');
  const [countdown, setCountdown] = useState(30);

  // Check if user has a saved session on mount
  useEffect(() => {
    const savedSession = localStorage.getItem('telegram_session');
    if (savedSession) {
      setSessionString(savedSession);
    }
  }, []);

  // Start QR login flow
  const startQRLogin = async () => {
    try {
      setLoginState('qr-loading');
      setError(null);

      const response = await fetch('/api/telegram/qr-login/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (data.success) {
        setQrData(data);
        setLoginState('qr-ready');
        setCountdown(data.expiresIn || 30);

        // Start checking for login status
        checkLoginStatus();
      } else {
        setError(data.error || 'Failed to generate QR code');
        setLoginState('initial');
      }
    } catch (err) {
      setError(err.message);
      setLoginState('initial');
    }
  };

  // Check login status periodically
  const checkLoginStatus = async () => {
    setLoginState('checking');

    const checkInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/telegram/qr-login/status');
        const data = await response.json();

        if (data.success && data.loggedIn) {
          clearInterval(checkInterval);
          setUser(data.user);
          setLoginState('logged-in');

          // Save session string
          if (data.sessionString) {
            localStorage.setItem('telegram_session', data.sessionString);
            setSessionString(data.sessionString);
          }
        }
      } catch (err) {
        console.error('Error checking login status:', err);
      }
    }, 2000);

    // Stop checking after 30 seconds
    setTimeout(() => {
      clearInterval(checkInterval);
      if (loginState !== 'logged-in') {
        setError('QR code expired. Please try again.');
        setLoginState('initial');
      }
    }, 30000);
  };

  // Login with saved session
  const loginWithSession = async () => {
    try {
      setLoginState('qr-loading');
      setError(null);

      const response = await fetch('/api/telegram/login/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionString })
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setLoginState('logged-in');
      } else {
        setError(data.error || 'Failed to login with session');
        setLoginState('initial');
        localStorage.removeItem('telegram_session');
      }
    } catch (err) {
      setError(err.message);
      setLoginState('initial');
    }
  };

  // Logout
  const logout = async () => {
    try {
      const response = await fetch('/api/telegram/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (data.success) {
        setUser(null);
        setLoginState('initial');
        setSessionString('');
        localStorage.removeItem('telegram_session');
      } else {
        setError(data.error || 'Failed to logout');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Countdown timer for QR code expiration
  useEffect(() => {
    if (loginState === 'qr-ready' || loginState === 'checking') {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setError('QR code expired. Please try again.');
            setLoginState('initial');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [loginState]);

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-cyan-600 to-teal-600 p-8"
      >
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <Send className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Telegram Login</h1>
              <p className="text-blue-100 mt-1">Authenticate with QR Code</p>
            </div>
          </div>
          <p className="text-blue-50 max-w-2xl">
            Scan the QR code with your Telegram mobile app to securely log in and access your saved messages.
          </p>
        </div>
      </motion.div>

      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-400 font-medium">Error</p>
            <p className="text-red-300 text-sm mt-1">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* QR Code Login */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <QrCode className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">QR Code Login</h2>
          </div>

          {loginState === 'initial' && (
            <div className="text-center py-8">
              <div className="mb-6">
                <QrCode className="w-24 h-24 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">
                  Click below to generate a QR code
                </p>
                <p className="text-gray-500 text-sm">
                  Open Telegram on your phone, go to Settings → Devices → Scan QR Code
                </p>
              </div>
              <button
                onClick={startQRLogin}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 mx-auto"
              >
                <QrCode className="w-5 h-5" />
                Generate QR Code
              </button>
            </div>
          )}

          {loginState === 'qr-loading' && (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Generating QR code...</p>
            </div>
          )}

          {(loginState === 'qr-ready' || loginState === 'checking') && qrData && (
            <div className="text-center">
              <div className="mb-4">
                <div className="bg-white p-4 rounded-2xl inline-block">
                  <img
                    src={qrData.qrImage}
                    alt="Telegram QR Code"
                    className="w-64 h-64 mx-auto"
                  />
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 mb-4">
                {loginState === 'checking' ? (
                  <>
                    <Loader2 className="w-4 h-4 text-green-500 animate-spin" />
                    <p className="text-green-400 font-medium">Waiting for scan...</p>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    <p className="text-gray-400">Scan this code with your Telegram app</p>
                  </>
                )}
              </div>
              <div className="text-sm text-gray-500 mb-4">
                Expires in <span className="text-orange-400 font-mono">{countdown}s</span>
              </div>
              <button
                onClick={startQRLogin}
                className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-2 mx-auto"
              >
                <RefreshCw className="w-4 h-4" />
                Generate New Code
              </button>
            </div>
          )}

          {loginState === 'logged-in' && user && (
            <div className="text-center py-8">
              <div className="mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Successfully Logged In!</h3>
                <p className="text-gray-400">You can now access your saved messages</p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4 space-y-3 text-left">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-gray-500 text-xs">Name</p>
                    <p className="text-white">{user.firstName} {user.lastName}</p>
                  </div>
                </div>
                {user.username && (
                  <div className="flex items-center gap-3">
                    <Send className="w-5 h-5 text-cyan-400" />
                    <div>
                      <p className="text-gray-500 text-xs">Username</p>
                      <p className="text-white">@{user.username}</p>
                    </div>
                  </div>
                )}
                {user.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-green-400" />
                    <div>
                      <p className="text-gray-500 text-xs">Phone</p>
                      <p className="text-white">{user.phone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* Session Login & Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Saved Session */}
          {sessionString && loginState !== 'logged-in' && (
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Shield className="w-5 h-5 text-purple-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">Saved Session</h2>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                You have a saved session. You can login quickly without scanning a QR code.
              </p>
              <button
                onClick={loginWithSession}
                disabled={loginState === 'qr-loading'}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loginState === 'qr-loading' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    Login with Saved Session
                  </>
                )}
              </button>
            </div>
          )}

          {/* Logout Button */}
          {loginState === 'logged-in' && (
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Session Management</h2>
              <p className="text-gray-400 text-sm mb-4">
                You are currently logged in. Your session is saved securely in your browser.
              </p>
              <button
                onClick={logout}
                className="w-full px-6 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">How to Login</h2>
            <ol className="space-y-3 text-sm text-gray-400">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <span>Click "Generate QR Code" to create a login QR code</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <span>Open Telegram on your mobile device</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <span>Go to Settings → Devices → Scan QR Code</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                <span>Scan the QR code displayed above</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center text-xs font-bold">5</span>
                <span>Confirm the login on your mobile device</span>
              </li>
            </ol>
          </div>

          {/* Next Steps */}
          {loginState === 'logged-in' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-6"
            >
              <h2 className="text-xl font-semibold text-white mb-4">What's Next?</h2>
              <p className="text-gray-300 text-sm mb-4">
                You're all set! Navigate to the Saved Messages page to analyze your Telegram saved messages.
              </p>
              <a
                href="/telegram/saved-messages"
                className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 font-medium"
              >
                Go to Saved Messages
                <ExternalLink className="w-4 h-4" />
              </a>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
