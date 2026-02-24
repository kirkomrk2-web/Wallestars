import React, { useState, Suspense, lazy, Component } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center p-6">
          <div className="text-red-400 text-4xl mb-4">⚠</div>
          <h2 className="text-white text-lg font-semibold mb-2">Page failed to load</h2>
          <p className="text-gray-400 text-sm mb-4">{this.state.error?.message || 'An unexpected error occurred'}</p>
          <button
            className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition-colors"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const Dashboard = lazy(() => import('./pages/Dashboard'));
const ClaudeChat = lazy(() => import('./pages/ClaudeChat'));
const ComputerControl = lazy(() => import('./pages/ComputerControl'));
const AndroidControl = lazy(() => import('./pages/AndroidControl'));
const QRScanner = lazy(() => import('./pages/QRScanner'));
const Settings = lazy(() => import('./pages/Settings'));
const PromptGenerator = lazy(() => import('./pages/PromptGenerator'));
const SmartScan = lazy(() => import('./pages/SmartScan'));
const HostingerManagement = lazy(() => import('./pages/HostingerManagement'));
const OrchestrationFarm = lazy(() => import('./pages/OrchestrationFarm'));
const MultiAgentDesign = lazy(() => import('./pages/MultiAgentDesign'));
const AgentRegistry = lazy(() => import('./pages/AgentRegistry'));
const EligibilityCheck = lazy(() => import('./pages/EligibilityCheck'));

const PAGE_COMPONENTS = {
  dashboard: Dashboard,
  chat: ClaudeChat,
  computer: ComputerControl,
  android: AndroidControl,
  qrscanner: QRScanner,
  smartscan: SmartScan,
  promptgen: PromptGenerator,
  hostinger: HostingerManagement,
  orchestration: OrchestrationFarm,
  multiagent: MultiAgentDesign,
  agentregistry: AgentRegistry,
  eligibility: EligibilityCheck,
  settings: Settings
};

function PageFallback() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const ActiveComponent = PAGE_COMPONENTS[activePage] || Dashboard;

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
            activePage={activePage}
            setActivePage={setActivePage}
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
                  key={activePage}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ErrorBoundary key={activePage}>
                    <Suspense fallback={<PageFallback />}>
                      <ActiveComponent />
                    </Suspense>
                  </ErrorBoundary>
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
