import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, Activity, Cpu, HardDrive, Wifi } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

export default function Header({ toggleSidebar, sidebarOpen }) {
  const { connected } = useSocket();
  const [time, setTime] = useState(new Date());
  const [systemStats, setSystemStats] = useState({
    cpu: 0,
    memory: 0,
    network: 'Connected'
  });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Simulate system stats (replace with real data)
    const interval = setInterval(() => {
      setSystemStats({
        cpu: Math.floor(Math.random() * 30) + 20,
        memory: Math.floor(Math.random() * 40) + 40,
        network: connected ? 'Connected' : 'Disconnected'
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [connected]);

  return (
    <header className="glass-effect border-b border-white/10 sticky top-0 z-40">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left section */}
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleSidebar}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </motion.button>

            <div>
              <h2 className="text-xl font-bold text-white">
                {time.toLocaleTimeString()}
              </h2>
              <p className="text-sm text-dark-400">
                {time.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Right section - System stats */}
          <div className="flex items-center gap-4">
            {/* CPU */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 glass-effect px-4 py-2 rounded-lg"
            >
              <Cpu className="w-4 h-4 text-primary-400" />
              <div>
                <p className="text-xs text-dark-400">CPU</p>
                <p className="text-sm font-semibold">{systemStats.cpu}%</p>
              </div>
            </motion.div>

            {/* Memory */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 glass-effect px-4 py-2 rounded-lg"
            >
              <HardDrive className="w-4 h-4 text-primary-400" />
              <div>
                <p className="text-xs text-dark-400">Memory</p>
                <p className="text-sm font-semibold">{systemStats.memory}%</p>
              </div>
            </motion.div>

            {/* Connection status */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 glass-effect px-4 py-2 rounded-lg"
            >
              <div className="relative">
                {connected ? (
                  <>
                    <Wifi className="w-4 h-4 text-green-400" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full pulse-ring"></div>
                  </>
                ) : (
                  <Wifi className="w-4 h-4 text-red-400" />
                )}
              </div>
              <div>
                <p className="text-xs text-dark-400">Status</p>
                <p className={`text-sm font-semibold ${connected ? 'text-green-400' : 'text-red-400'}`}>
                  {systemStats.network}
                </p>
              </div>
            </motion.div>

            {/* Activity indicator */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="p-3 glass-effect rounded-lg"
            >
              <Activity className="w-5 h-5 text-primary-400" />
            </motion.div>
          </div>
        </div>
      </div>
    </header>
  );
}
