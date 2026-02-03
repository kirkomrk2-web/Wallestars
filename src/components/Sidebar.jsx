import React from 'react';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  Monitor,
  Smartphone,
  Settings,
  Zap,
  QrCode,
  Sparkles,
  ScanLine,
  Server,
  FileText
} from 'lucide-react';

const menuItems = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { id: 'chat', name: 'Claude Chat', icon: MessageSquare, path: '/chat' },
  { id: 'computer', name: 'Computer Use', icon: Monitor, path: '/computer' },
  { id: 'android', name: 'Android Control', icon: Smartphone, path: '/android' },
  { id: 'qrscanner', name: 'QR Scanner', icon: QrCode, path: '/qrscanner' },
  { id: 'smartscan', name: 'Smart Scan', icon: ScanLine, path: '/smartscan' },
  { id: 'promptgen', name: 'Prompt Generator', icon: Sparkles, path: '/promptgen' },
  { id: 'hostinger', name: 'Hostinger VPS', icon: Server, path: '/hostinger' },
  { id: 'settings', name: 'Settings', icon: Settings, path: '/settings' },
  { id: 'logs', name: 'System Logs', icon: FileText, path: '/logs' },
];

export default function Sidebar({ isOpen }) {
  return (
    <motion.aside
      initial={false}
      animate={{
        width: isOpen ? '16rem' : '5rem',
      }}
      className="fixed left-0 top-0 h-screen glass-effect border-r border-white/10 z-50"
    >
      <div className="p-6 h-full overflow-y-auto pb-28 scrollbar-hide">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                Wallestars
              </h1>
              <p className="text-xs text-dark-400">Control Center</p>
            </motion.div>
          )}
        </div>

        {/* Menu Items */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) => `
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-all duration-200 relative overflow-hidden block
                  ${isActive
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
                    : 'text-dark-300 hover:text-white hover:bg-white/5'
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-600"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}

                    <Icon className="w-5 h-5 relative z-10" />

                    {isOpen && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="relative z-10 font-medium"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Status indicator */}
      <div className="absolute bottom-6 left-6 right-6">
        <div className="glass-effect rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full pulse-ring"></div>
            </div>
            {isOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-dark-300"
              >
                System Online
              </motion.span>
            )}
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
