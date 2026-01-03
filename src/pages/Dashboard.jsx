import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Zap,
  Monitor,
  Smartphone,
  MessageSquare,
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';

export default function Dashboard() {
  const { connected, actionLogs } = useSocket();
  const [stats, setStats] = useState({
    totalActions: 0,
    claudeRequests: 0,
    systemUptime: 0,
    successRate: 98.5
  });

  useEffect(() => {
    // Fetch dashboard stats
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        console.log('Health check:', data);
      })
      .catch(err => console.error('Health check failed:', err));

    // Update stats
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        totalActions: prev.totalActions + Math.floor(Math.random() * 3),
        systemUptime: prev.systemUptime + 1
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const statCards = [
    {
      title: 'Total Actions',
      value: stats.totalActions,
      icon: Activity,
      color: 'from-blue-500 to-blue-600',
      change: '+12%'
    },
    {
      title: 'Claude Requests',
      value: actionLogs.length,
      icon: MessageSquare,
      color: 'from-purple-500 to-purple-600',
      change: '+8%'
    },
    {
      title: 'System Uptime',
      value: `${Math.floor(stats.systemUptime / 60)}m`,
      icon: Clock,
      color: 'from-green-500 to-green-600',
      change: '100%'
    },
    {
      title: 'Success Rate',
      value: `${stats.successRate}%`,
      icon: CheckCircle,
      color: 'from-amber-500 to-amber-600',
      change: '+2%'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
              Welcome to Wallestars
            </h1>
            <p className="text-dark-400 mt-2">
              Your intelligent automation control center powered by Claude AI
            </p>
          </div>
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
            className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center"
          >
            <Zap className="w-8 h-8 text-white" />
          </motion.div>
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="card"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm text-green-400 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  {stat.change}
                </span>
              </div>
              <h3 className="text-dark-400 text-sm mb-1">{stat.title}</h3>
              <p className="text-2xl font-bold">{stat.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Quick actions & Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary-400" />
            Quick Actions
          </h2>
          <div className="space-y-3">
            <QuickActionButton
              icon={Monitor}
              title="Computer Use"
              description="Control your Linux desktop"
              color="from-blue-500 to-blue-600"
            />
            <QuickActionButton
              icon={Smartphone}
              title="Android Control"
              description="Manage connected devices"
              color="from-green-500 to-green-600"
            />
            <QuickActionButton
              icon={MessageSquare}
              title="Chat with Claude"
              description="AI-powered conversations"
              color="from-purple-500 to-purple-600"
            />
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary-400" />
            Recent Activity
          </h2>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {actionLogs.length === 0 ? (
              <p className="text-dark-400 text-center py-8">No recent activity</p>
            ) : (
              actionLogs.slice(0, 10).map((log, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-effect p-3 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{log.action || 'Unknown action'}</p>
                      <p className="text-xs text-dark-400">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* System Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <h2 className="text-xl font-bold mb-4">System Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatusIndicator
            label="Claude API"
            status={connected ? 'Operational' : 'Disconnected'}
            isOnline={connected}
          />
          <StatusIndicator
            label="Computer Use"
            status="Ready"
            isOnline={true}
          />
          <StatusIndicator
            label="Android Bridge"
            status="Standby"
            isOnline={false}
          />
        </div>
      </motion.div>
    </div>
  );
}

function QuickActionButton({ icon: Icon, title, description, color }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="w-full glass-effect p-4 rounded-lg hover:bg-white/10 transition-all text-left"
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-lg flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-dark-400">{description}</p>
        </div>
      </div>
    </motion.button>
  );
}

function StatusIndicator({ label, status, isOnline }) {
  return (
    <div className="glass-effect p-4 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-dark-400">{label}</span>
        <div className="relative">
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-500'}`}></div>
          {isOnline && (
            <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full pulse-ring"></div>
          )}
        </div>
      </div>
      <p className={`font-semibold ${isOnline ? 'text-green-400' : 'text-gray-400'}`}>
        {status}
      </p>
    </div>
  );
}
