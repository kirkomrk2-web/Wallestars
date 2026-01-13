import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Layout,
  Grid,
  List,
  Layers,
  Zap,
  Monitor,
  Smartphone,
  MessageSquare,
  Settings,
  Cloud,
  Database,
  Code,
  Terminal,
  Cpu,
  HardDrive,
  Activity,
  Bell,
  Mail,
  Calendar,
  ArrowRight
} from 'lucide-react';
import ButtonGrid, { ButtonGridItem, ButtonList, ButtonListItem } from '../components/ButtonGrid';
import SwipeContainer from '../components/SwipeContainer';

export default function LayoutDemo() {
  const [activeLayout, setActiveLayout] = useState('grid');
  const [gridColumns, setGridColumns] = useState(3);

  const demoButtons = [
    {
      icon: Monitor,
      title: 'Computer Use',
      description: 'Control Linux desktop',
      color: 'from-blue-500 via-blue-600 to-cyan-600'
    },
    {
      icon: Smartphone,
      title: 'Android Control',
      description: 'Manage devices',
      color: 'from-emerald-500 via-green-600 to-teal-600'
    },
    {
      icon: MessageSquare,
      title: 'Claude Chat',
      description: 'AI conversations',
      color: 'from-purple-500 via-purple-600 to-pink-600'
    },
    {
      icon: Cloud,
      title: 'Cloud Storage',
      description: 'File management',
      color: 'from-cyan-500 via-blue-600 to-blue-700'
    },
    {
      icon: Database,
      title: 'Database',
      description: 'Data management',
      color: 'from-amber-500 via-orange-600 to-red-600'
    },
    {
      icon: Code,
      title: 'Code Editor',
      description: 'Edit code',
      color: 'from-indigo-500 via-purple-600 to-pink-600'
    },
    {
      icon: Terminal,
      title: 'Terminal',
      description: 'Command line',
      color: 'from-gray-500 via-slate-600 to-gray-700'
    },
    {
      icon: Settings,
      title: 'Settings',
      description: 'Configuration',
      color: 'from-rose-500 via-pink-600 to-purple-600'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-ultra"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
            <Layout className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gradient-primary">
              Layout Algorithm System
            </h1>
            <p className="text-dark-400">
              Dynamic containers with intelligent button layouts and swipe effects
            </p>
          </div>
        </div>

        {/* Layout controls */}
        <div className="flex flex-wrap gap-4 mt-6">
          <button
            onClick={() => setActiveLayout('grid')}
            className={`btn-secondary flex items-center gap-2 ${
              activeLayout === 'grid' ? 'bg-primary-500 text-white' : ''
            }`}
          >
            <Grid className="w-4 h-4" />
            Grid Layout
          </button>
          <button
            onClick={() => setActiveLayout('list')}
            className={`btn-secondary flex items-center gap-2 ${
              activeLayout === 'list' ? 'bg-primary-500 text-white' : ''
            }`}
          >
            <List className="w-4 h-4" />
            List Layout
          </button>
          <button
            onClick={() => setActiveLayout('swipe')}
            className={`btn-secondary flex items-center gap-2 ${
              activeLayout === 'swipe' ? 'bg-primary-500 text-white' : ''
            }`}
          >
            <Layers className="w-4 h-4" />
            Swipe Layout
          </button>

          {activeLayout === 'grid' && (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-dark-400">Columns:</span>
              {[2, 3, 4].map(cols => (
                <button
                  key={cols}
                  onClick={() => setGridColumns(cols)}
                  className={`w-8 h-8 rounded-lg ${
                    gridColumns === cols
                      ? 'bg-primary-500 text-white'
                      : 'bg-dark-800 text-dark-400'
                  }`}
                >
                  {cols}
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Grid Layout Demo */}
      {activeLayout === 'grid' && (
        <motion.div
          key="grid"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-ultra"
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Grid className="w-6 h-6 text-primary-400" />
            <span className="text-gradient-primary">Button Grid Layout</span>
          </h2>

          <ButtonGrid columns={gridColumns} gap={20}>
            {demoButtons.map((button, index) => (
              <ButtonGridItem
                key={index}
                icon={button.icon}
                title={button.title}
                description={button.description}
                color={button.color}
                badge={index === 0 ? 'NEW' : null}
                onClick={() => console.log(`Clicked: ${button.title}`)}
              />
            ))}
          </ButtonGrid>
        </motion.div>
      )}

      {/* List Layout Demo */}
      {activeLayout === 'list' && (
        <motion.div
          key="list"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-ultra"
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <List className="w-6 h-6 text-primary-400" />
            <span className="text-gradient-primary">Button List Layout</span>
          </h2>

          <ButtonList gap={16}>
            {demoButtons.map((button, index) => (
              <ButtonListItem
                key={index}
                icon={button.icon}
                title={button.title}
                description={button.description}
                color={button.color}
                rightIcon={ArrowRight}
                badge={index === 2 ? '5' : null}
                onClick={() => console.log(`Clicked: ${button.title}`)}
              />
            ))}
          </ButtonList>
        </motion.div>
      )}

      {/* Swipe Layout Demo */}
      {activeLayout === 'swipe' && (
        <motion.div
          key="swipe"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-ultra"
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Layers className="w-6 h-6 text-primary-400" />
            <span className="text-gradient-primary">Swipeable Containers</span>
          </h2>

          <SwipeContainer
            showControls={true}
            enablePagination={true}
            autoPlay={false}
            onSwipeLeft={() => console.log('Swiped left')}
            onSwipeRight={() => console.log('Swiped right')}
          >
            {/* Page 1 - System Stats */}
            <div className="min-h-[400px] p-8">
              <h3 className="text-2xl font-bold mb-6 text-gradient-primary">
                System Statistics
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <StatCard
                  icon={Cpu}
                  title="CPU Usage"
                  value="45%"
                  color="from-blue-500 to-cyan-600"
                />
                <StatCard
                  icon={HardDrive}
                  title="Storage"
                  value="67%"
                  color="from-purple-500 to-pink-600"
                />
                <StatCard
                  icon={Activity}
                  title="Memory"
                  value="8.2 GB"
                  color="from-emerald-500 to-teal-600"
                />
                <StatCard
                  icon={Zap}
                  title="Uptime"
                  value="24h"
                  color="from-amber-500 to-orange-600"
                />
              </div>
            </div>

            {/* Page 2 - Quick Actions */}
            <div className="min-h-[400px] p-8">
              <h3 className="text-2xl font-bold mb-6 text-gradient-primary">
                Quick Actions
              </h3>
              <ButtonGrid columns={2} gap={16}>
                {demoButtons.slice(0, 4).map((button, index) => (
                  <ButtonGridItem
                    key={index}
                    icon={button.icon}
                    title={button.title}
                    description={button.description}
                    color={button.color}
                    onClick={() => console.log(`Clicked: ${button.title}`)}
                  />
                ))}
              </ButtonGrid>
            </div>

            {/* Page 3 - Notifications */}
            <div className="min-h-[400px] p-8">
              <h3 className="text-2xl font-bold mb-6 text-gradient-primary">
                Recent Notifications
              </h3>
              <ButtonList gap={12}>
                <NotificationItem
                  icon={Bell}
                  title="System Update Available"
                  time="2 min ago"
                  color="from-blue-500 to-cyan-600"
                />
                <NotificationItem
                  icon={Mail}
                  title="New Message Received"
                  time="5 min ago"
                  color="from-purple-500 to-pink-600"
                />
                <NotificationItem
                  icon={Calendar}
                  title="Meeting Starting Soon"
                  time="10 min ago"
                  color="from-emerald-500 to-teal-600"
                />
              </ButtonList>
            </div>
          </SwipeContainer>
        </motion.div>
      )}

      {/* Features showcase */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card-ultra"
      >
        <h2 className="text-2xl font-bold mb-6 text-gradient-primary">
          System Features
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FeatureCard
            icon={Zap}
            title="Intelligent Layout"
            description="Automatically calculates optimal grid layout based on screen size and content"
          />
          <FeatureCard
            icon={Layers}
            title="Swipe Gestures"
            description="Touch and mouse gesture support with velocity detection"
          />
          <FeatureCard
            icon={Grid}
            title="Responsive Design"
            description="Adapts to any screen size with smart column calculations"
          />
          <FeatureCard
            icon={Zap}
            title="Smooth Animations"
            description="Hardware-accelerated animations with Framer Motion"
          />
        </div>
      </motion.div>
    </div>
  );
}

// Helper components
function StatCard({ icon: Icon, title, value, color }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      className="glass-effect-hover p-6 rounded-xl"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 bg-gradient-to-br ${color} rounded-lg flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h4 className="font-semibold text-dark-300">{title}</h4>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
    </motion.div>
  );
}

function NotificationItem({ icon: Icon, title, time, color }) {
  return (
    <div className="glass-effect-hover p-4 rounded-xl flex items-center gap-3">
      <div className={`w-10 h-10 bg-gradient-to-br ${color} rounded-lg flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm text-white truncate">{title}</h4>
        <p className="text-xs text-dark-400">{time}</p>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="glass-effect-hover p-6 rounded-xl"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-white mb-2">{title}</h3>
          <p className="text-sm text-dark-400">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}
