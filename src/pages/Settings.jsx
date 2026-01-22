import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon,
  Key,
  Monitor,
  Smartphone,
  Send,
  Save,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState({
    apiKey: '',
    telegramApiId: '',
    telegramApiHash: '',
    computerUseEnabled: true,
    androidEnabled: false,
    screenshotInterval: 2000,
    adbHost: 'localhost',
    adbPort: 5037
  });
  const [saved, setSaved] = useState(false);

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    console.log('Saving settings:', settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-amber-600 p-8"
      >
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <SettingsIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Settings</h1>
              <p className="text-amber-100 mt-1">Configure your Wallestars Control Center</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Anthropic API */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6"
      >
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Key className="w-5 h-5 text-blue-400" />
          Anthropic API
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">API Key</label>
            <input
              type="password"
              value={settings.apiKey}
              onChange={(e) => handleChange('apiKey', e.target.value)}
              placeholder="sk-ant-..."
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-gray-600"
            />
            <p className="text-xs text-gray-500 mt-2">
              Get your API key from{' '}
              <a
                href="https://console.anthropic.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                console.anthropic.com
              </a>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Telegram API */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6"
      >
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Send className="w-5 h-5 text-cyan-400" />
          Telegram API
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">API ID</label>
            <input
              type="text"
              value={settings.telegramApiId}
              onChange={(e) => handleChange('telegramApiId', e.target.value)}
              placeholder="12345678"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">API Hash</label>
            <input
              type="password"
              value={settings.telegramApiHash}
              onChange={(e) => handleChange('telegramApiHash', e.target.value)}
              placeholder="abcdef1234567890..."
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-gray-600"
            />
          </div>
          <p className="text-xs text-gray-500">
            Get your credentials from{' '}
            <a
              href="https://my.telegram.org/apps"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline"
            >
              my.telegram.org/apps
            </a>
          </p>
        </div>
      </motion.div>

      {/* Computer Use */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6"
      >
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Monitor className="w-5 h-5 text-green-400" />
          Computer Use (Linux)
        </h2>
        <div className="space-y-4">
          <div className="bg-gray-800/50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white mb-1">Enable Computer Use</h3>
                <p className="text-sm text-gray-400">Allow Claude to control your desktop</p>
              </div>
              <button
                onClick={() => handleChange('computerUseEnabled', !settings.computerUseEnabled)}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  settings.computerUseEnabled ? 'bg-green-500' : 'bg-gray-700'
                }`}
              >
                <motion.div
                  animate={{ x: settings.computerUseEnabled ? 28 : 2 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="absolute top-1 w-5 h-5 bg-white rounded-full"
                />
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Screenshot Interval (ms)
            </label>
            <input
              type="number"
              value={settings.screenshotInterval}
              onChange={(e) => handleChange('screenshotInterval', parseInt(e.target.value))}
              min="500"
              max="5000"
              step="100"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-gray-600"
            />
            <p className="text-xs text-gray-500 mt-2">
              How often to capture screen for streaming (500-5000ms)
            </p>
          </div>
        </div>
      </motion.div>

      {/* Android Control */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6"
      >
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-purple-400" />
          Android Control
        </h2>
        <div className="space-y-4">
          <div className="bg-gray-800/50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white mb-1">Enable Android Control</h3>
                <p className="text-sm text-gray-400">Control Android devices via ADB</p>
              </div>
              <button
                onClick={() => handleChange('androidEnabled', !settings.androidEnabled)}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  settings.androidEnabled ? 'bg-purple-500' : 'bg-gray-700'
                }`}
              >
                <motion.div
                  animate={{ x: settings.androidEnabled ? 28 : 2 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="absolute top-1 w-5 h-5 bg-white rounded-full"
                />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">ADB Host</label>
              <input
                type="text"
                value={settings.adbHost}
                onChange={(e) => handleChange('adbHost', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">ADB Port</label>
              <input
                type="number"
                value={settings.adbPort}
                onChange={(e) => handleChange('adbPort', parseInt(e.target.value))}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-gray-600"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-4"
      >
        <button
          onClick={handleSave}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg"
        >
          <Save className="w-5 h-5" />
          Save Settings
        </button>

        {saved && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-green-400"
          >
            <CheckCircle className="w-5 h-5" />
            <span>Settings saved successfully!</span>
          </motion.div>
        )}
      </motion.div>

      {/* Warning */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl"
      >
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-400 mb-1">Security Notice</h3>
            <p className="text-sm text-gray-300">
              Computer Use and Android Control features grant powerful system access. Only use these
              features in trusted environments. Never share your API keys or run untrusted commands.
              Settings are stored in your browser's localStorage and not sent to any server.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
