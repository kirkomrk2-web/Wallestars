import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import ClaudeChat from './pages/ClaudeChat';
import ComputerControl from './pages/ComputerControl';
import AndroidControl from './pages/AndroidControl';
import Settings from './pages/Settings';
import PromptGenerator from './pages/PromptGenerator';
import SmartScan from './pages/SmartScan';
import LayoutDemo from './pages/LayoutDemo';
import PhotoShare from './pages/PhotoShare';
import PhotoShareViewer from './pages/PhotoShareViewer';
import { SocketProvider } from './context/SocketContext';

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  // Hide sidebar and header for photo share viewer
  const isPhotoShareViewer = location.pathname.startsWith('/share/view/');

  if (isPhotoShareViewer) {
    return (
      <Routes>
        <Route path="/share/view/:shareId" element={<PhotoShareViewer />} />
      </Routes>
    );
  }

  return (
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
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/chat" element={<ClaudeChat />} />
                  <Route path="/computer" element={<ComputerControl />} />
                  <Route path="/android" element={<AndroidControl />} />
                  <Route path="/smartscan" element={<SmartScan />} />
                  <Route path="/promptgen" element={<PromptGenerator />} />
                  <Route path="/layoutdemo" element={<LayoutDemo />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/share/new" element={<PhotoShare />} />
                </Routes>
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <SocketProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </SocketProvider>
  );
}

export default App;
