import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import ClaudeChat from './pages/ClaudeChat';
import ComputerControl from './pages/ComputerControl';
import AndroidControl from './pages/AndroidControl';
import QRScanner from './pages/QRScanner';
import Settings from './pages/Settings';
import PromptGenerator from './pages/PromptGenerator';
import SmartScan from './pages/SmartScan';
import HostingerManagement from './pages/HostingerManagement';
import SystemLogs from './pages/SystemLogs';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  return (
    <ThemeProvider>
      <SocketProvider>
        <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 animate-gradient">
        {/* Background effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 -left-4 w-96 h-96 bg-primary-500/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow"></div>
          <div className="absolute top-0 -right-4 w-96 h-96 bg-primary-600/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-primary-400/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow animation-delay-4000"></div>
        </div>

        <div className="relative flex">
          {/* Sidebar */}
          <Sidebar
            isOpen={sidebarOpen}
            setIsOpen={setSidebarOpen}
          />

          {/* Main content */}
          <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
            <Header
              toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
              sidebarOpen={sidebarOpen}
            />

            <main className="p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Routes location={location} key={location.pathname}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/chat" element={<ClaudeChat />} />
                    <Route path="/computer" element={<ComputerControl />} />
                    <Route path="/android" element={<AndroidControl />} />
                    <Route path="/qrscanner" element={<QRScanner />} />
                    <Route path="/smartscan" element={<SmartScan />} />
                    <Route path="/promptgen" element={<PromptGenerator />} />
                    <Route path="/hostinger" element={<HostingerManagement />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/logs" element={<SystemLogs />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </div>
        </div>
      </SocketProvider>
    </ThemeProvider>
  );
}

export default App;
