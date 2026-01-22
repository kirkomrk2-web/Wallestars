import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  BarChart3,
  Search,
  Calendar,
  Link2,
  Image as ImageIcon,
  Video,
  FileText,
  TrendingUp,
  Download,
  Filter,
  Loader2,
  RefreshCw,
  AlertCircle,
  Clock,
  Hash
} from 'lucide-react';

export default function TelegramSavedMessages() {
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('messages'); // messages, analytics, search

  // Fetch saved messages
  const fetchMessages = async (limit = 100) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/telegram/messages/saved?limit=${limit}`);
      const data = await response.json();

      if (data.success) {
        setMessages(data.messages);
      } else {
        setError(data.error || 'Failed to fetch messages');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Analyze messages
  const analyzeMessages = async (limit = 500) => {
    try {
      setAnalyzing(true);
      setError(null);

      const response = await fetch(`/api/telegram/messages/analyze?limit=${limit}`);
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
        setActiveTab('analytics');
      } else {
        setError(data.error || 'Failed to analyze messages');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  // Search messages
  const searchMessages = async () => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/telegram/messages/search?q=${encodeURIComponent(searchQuery)}&limit=50`);
      const data = await response.json();

      if (data.success) {
        setSearchResults(data.messages);
        setActiveTab('search');
      } else {
        setError(data.error || 'Failed to search messages');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load messages on mount
  useEffect(() => {
    fetchMessages();
  }, []);

  // Format date
  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 via-pink-600 to-rose-600 p-8"
      >
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Saved Messages Analyzer</h1>
                <p className="text-purple-100 mt-1">Analyze and explore your Telegram saved messages</p>
              </div>
            </div>
            <button
              onClick={() => fetchMessages(100)}
              disabled={loading}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </>
              )}
            </button>
          </div>
          <p className="text-purple-50 max-w-2xl">
            View your saved messages, analyze patterns, and search through your Telegram archive.
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            <p className="text-gray-400 text-sm">Total Messages</p>
          </div>
          <p className="text-2xl font-bold text-white">{messages.length}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl p-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <ImageIcon className="w-5 h-5 text-purple-400" />
            <p className="text-gray-400 text-sm">Media Messages</p>
          </div>
          <p className="text-2xl font-bold text-white">
            {messages.filter(m => m.media).length}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl p-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-5 h-5 text-green-400" />
            <p className="text-gray-400 text-sm">Text Messages</p>
          </div>
          <p className="text-2xl font-bold text-white">
            {messages.filter(m => m.message).length}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-xl p-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-5 h-5 text-orange-400" />
            <p className="text-gray-400 text-sm">Analytics</p>
          </div>
          <button
            onClick={() => analyzeMessages(500)}
            disabled={analyzing}
            className="text-sm font-medium text-orange-400 hover:text-orange-300 flex items-center gap-1"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Run Analysis'
            )}
          </button>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-800">
        <button
          onClick={() => setActiveTab('messages')}
          className={`px-4 py-2 font-medium transition-all duration-200 ${
            activeTab === 'messages'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Messages
          </div>
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 font-medium transition-all duration-200 ${
            activeTab === 'analytics'
              ? 'text-purple-400 border-b-2 border-purple-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </div>
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`px-4 py-2 font-medium transition-all duration-200 ${
            activeTab === 'search'
              ? 'text-green-400 border-b-2 border-green-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Search
          </div>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'messages' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Recent Messages</h2>
            <select
              onChange={(e) => fetchMessages(parseInt(e.target.value))}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
            >
              <option value="50">Last 50</option>
              <option value="100" selected>Last 100</option>
              <option value="200">Last 200</option>
              <option value="500">Last 500</option>
            </select>
          </div>

          <div className="space-y-3">
            {messages.map((msg, idx) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.02 }}
                className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {formatDate(msg.date)}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Hash className="w-3 h-3" />
                    {msg.id}
                  </div>
                </div>

                {msg.message && (
                  <p className="text-gray-300 mb-2 break-words">{msg.message}</p>
                )}

                {msg.media && (
                  <div className="flex items-center gap-2 text-sm">
                    {msg.media.hasPhoto && (
                      <span className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" />
                        Photo
                      </span>
                    )}
                    {msg.media.hasVideo && (
                      <span className="px-2 py-1 bg-purple-500/10 text-purple-400 rounded flex items-center gap-1">
                        <Video className="w-3 h-3" />
                        Video
                      </span>
                    )}
                    {msg.media.hasDocument && (
                      <span className="px-2 py-1 bg-green-500/10 text-green-400 rounded flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        Document
                      </span>
                    )}
                  </div>
                )}
              </motion.div>
            ))}

            {messages.length === 0 && !loading && (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No messages found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && stats && (
        <div className="space-y-6">
          {/* Overview Stats */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="w-5 h-5 text-blue-400" />
                <h3 className="font-semibold text-white">Total Analyzed</h3>
              </div>
              <p className="text-3xl font-bold text-white mb-2">{stats.totalMessages}</p>
              <div className="text-sm text-gray-400 space-y-1">
                <p>Text: {stats.textMessages}</p>
                <p>Media: {stats.mediaMessages}</p>
              </div>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Link2 className="w-5 h-5 text-purple-400" />
                <h3 className="font-semibold text-white">Links Found</h3>
              </div>
              <p className="text-3xl font-bold text-white mb-2">{stats.linksCount}</p>
              <p className="text-sm text-gray-400">Unique: {stats.links.length}</p>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-5 h-5 text-green-400" />
                <h3 className="font-semibold text-white">Word Count</h3>
              </div>
              <p className="text-3xl font-bold text-white mb-2">{stats.wordCount}</p>
              <p className="text-sm text-gray-400">Avg: {stats.averageMessageLength} words/msg</p>
            </div>
          </div>

          {/* Top Words */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Top Words</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {stats.topWords.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-gray-800/50 rounded-lg p-3 text-center"
                >
                  <p className="text-white font-medium truncate">{item.word}</p>
                  <p className="text-gray-400 text-sm">{item.count}x</p>
                </div>
              ))}
            </div>
          </div>

          {/* Links */}
          {stats.links.length > 0 && (
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Found Links</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {stats.links.map((link, idx) => (
                  <a
                    key={idx}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-gray-800/50 rounded-lg p-3 hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Link2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      <p className="text-blue-400 hover:text-blue-300 text-sm truncate">{link}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Media Types */}
          {Object.keys(stats.mediaTypes).length > 0 && (
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Media Types</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(stats.mediaTypes).map(([type, count]) => (
                  <div
                    key={type}
                    className="bg-gray-800/50 rounded-lg p-3 text-center"
                  >
                    <p className="text-white font-medium">{type}</p>
                    <p className="text-gray-400 text-sm">{count}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'analytics' && !stats && (
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">No analytics data yet</p>
          <button
            onClick={() => analyzeMessages(500)}
            disabled={analyzing}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 mx-auto disabled:opacity-50"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <BarChart3 className="w-5 h-5" />
                Run Analysis
              </>
            )}
          </button>
        </div>
      )}

      {activeTab === 'search' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchMessages()}
              placeholder="Search your saved messages..."
              className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={searchMessages}
              disabled={loading || !searchQuery.trim()}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Search
                </>
              )}
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-3">
              <p className="text-gray-400 text-sm">Found {searchResults.length} results</p>
              {searchResults.map((msg, idx) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {formatDate(msg.date)}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Hash className="w-3 h-3" />
                      {msg.id}
                    </div>
                  </div>

                  {msg.message && (
                    <p className="text-gray-300 break-words">{msg.message}</p>
                  )}

                  {msg.media && (
                    <div className="flex items-center gap-2 text-sm mt-2">
                      <span className="px-2 py-1 bg-purple-500/10 text-purple-400 rounded">
                        {msg.media.type}
                      </span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {searchResults.length === 0 && searchQuery && !loading && (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No results found for "{searchQuery}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
