import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  MessageSquare,
  Clock,
  FileCode,
  Terminal,
  Search,
  BookOpen,
  Trophy,
  Code,
  Layers,
  Database,
  Cpu,
  Globe,
  Smartphone,
  Sparkles,
  Hash
} from 'lucide-react';

// Mock session data – used when localStorage has no sessions
const MOCK_SESSIONS = [
  {
    id: 'mock-1',
    title: 'React Multi-Agent Dashboard Architecture',
    description: 'Building scalable multi-agent UI with Socket.IO',
    messages: new Array(87).fill(null).map((_, i) => ({
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: 'Message content ' + i,
      timestamp: new Date()
    })),
    createdAt: '2026-03-01T09:15:00Z',
    updatedAt: '2026-03-01T13:42:00Z',
    bulgariанTopic: 'Изграждане на React архитектура за мулти-агент контролно табло с реално-временни Socket.IO актуализации и Framer Motion анимации.',
    artifacts: ['src/pages/Dashboard.jsx', 'src/context/SocketContext.jsx', 'src/components/Header.jsx', 'vite.config.js'],
    firstQuestion: 'How do I structure a React dashboard with real-time WebSocket updates and animated components?',
    tags: ['React', 'Socket.IO', 'Framer Motion', 'Dashboard']
  },
  {
    id: 'mock-2',
    title: 'Android ADB Automation with Claude',
    description: 'Automating Android device control via ADB commands',
    messages: new Array(74).fill(null).map((_, i) => ({
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: 'Message content ' + i,
      timestamp: new Date()
    })),
    createdAt: '2026-02-28T14:00:00Z',
    updatedAt: '2026-02-28T17:55:00Z',
    bulgariаnTopic: 'Автоматизация на Android устройства чрез ADB команди интегрирани с Claude AI за интелигентно управление на мобилни приложения.',
    artifacts: ['server/routes/android.js', 'src/pages/AndroidControl.jsx', 'server/index.js'],
    firstQuestion: 'Can you help me build an ADB automation system that uses Claude to intelligently control Android devices?',
    tags: ['ADB', 'Android', 'Automation', 'Claude AI']
  },
  {
    id: 'mock-3',
    title: 'Smart Document Scanner with OCR',
    description: 'AI-powered document classification and data extraction',
    messages: new Array(68).fill(null).map((_, i) => ({
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: 'Message content ' + i,
      timestamp: new Date()
    })),
    createdAt: '2026-02-26T10:30:00Z',
    updatedAt: '2026-02-26T14:15:00Z',
    bulgariаnTopic: 'Изграждане на интелигентен скенер за документи с OCR, класификация на типове документи и извличане на структурирани данни с поддръжка на български език.',
    artifacts: ['server/routes/documentScanner.js', 'src/pages/SmartScan.jsx', 'prompts/scan-template.md'],
    firstQuestion: 'How do I implement an AI document scanner that can classify Bulgarian documents and extract data?',
    tags: ['OCR', 'Document Scanner', 'Bulgarian', 'AI Extraction']
  },
  {
    id: 'mock-4',
    title: 'Hostinger VPS Deployment Pipeline',
    description: 'Setting up CI/CD with PM2 and GitHub Actions',
    messages: new Array(61).fill(null).map((_, i) => ({
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: 'Message content ' + i,
      timestamp: new Date()
    })),
    createdAt: '2026-02-24T08:00:00Z',
    updatedAt: '2026-02-24T11:45:00Z',
    bulgariаnTopic: 'Конфигуриране на автоматичен деплоймент пайплайн към Hostinger VPS с PM2, GitHub Actions и мониторинг на производителността.',
    artifacts: ['.github/workflows/deploy-hostinger-vps.yml', 'ecosystem.config.js', 'server/routes/hostinger.js'],
    firstQuestion: 'Help me set up an automated CI/CD pipeline to deploy my Node.js app to Hostinger VPS using PM2.',
    tags: ['Hostinger', 'PM2', 'GitHub Actions', 'Deployment']
  },
  {
    id: 'mock-5',
    title: 'Role-Based Access Control System',
    description: 'Implementing RBAC with Antigravity integration',
    messages: new Array(55).fill(null).map((_, i) => ({
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: 'Message content ' + i,
      timestamp: new Date()
    })),
    createdAt: '2026-02-22T13:00:00Z',
    updatedAt: '2026-02-22T16:30:00Z',
    bulgariаnTopic: 'Реализация на система за управление на достъп базирана на роли (RBAC) с три нива - Admin, Operator, Viewer и интеграция с Antigravity security framework.',
    artifacts: ['server/middleware/auth.js', 'server/services/permissions.js', 'antigravity-integration/'],
    firstQuestion: 'I need a robust RBAC system with Admin, Operator, and Viewer roles that integrates with our security framework.',
    tags: ['RBAC', 'Security', 'Middleware', 'Auth']
  },
  {
    id: 'mock-6',
    title: 'N8N Workflow Automation Integration',
    description: 'Connecting Claude with N8N webhook workflows',
    messages: new Array(49).fill(null).map((_, i) => ({
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: 'Message content ' + i,
      timestamp: new Date()
    })),
    createdAt: '2026-02-20T09:45:00Z',
    updatedAt: '2026-02-20T12:20:00Z',
    bulgariаnTopic: 'Интеграция на N8N автоматизационни работни процеси с Claude AI чрез webhook ендпойнти за тригериране на комплексни автоматизации.',
    artifacts: ['server/routes/n8nWebhooks.js', 'n8n-workflows/main-workflow.json', 'server/index.js'],
    firstQuestion: 'How can I integrate N8N workflows with Claude AI to trigger automated actions via webhooks?',
    tags: ['N8N', 'Webhooks', 'Automation', 'Workflow']
  },
  {
    id: 'mock-7',
    title: 'Linux Desktop Computer Use API',
    description: 'Building xdotool-based desktop automation',
    messages: new Array(45).fill(null).map((_, i) => ({
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: 'Message content ' + i,
      timestamp: new Date()
    })),
    createdAt: '2026-02-18T11:00:00Z',
    updatedAt: '2026-02-18T13:45:00Z',
    bulgariаnTopic: 'Разработване на API за управление на Linux Desktop използвайки xdotool за симулация на клавиатура, мишка и скрийншоти с Claude Computer Use.',
    artifacts: ['server/routes/computerUse.js', 'src/pages/ComputerControl.jsx', 'server/routes/claude.js'],
    firstQuestion: 'Build me a Linux desktop automation system using xdotool that Claude can control remotely.',
    tags: ['Linux', 'xdotool', 'Computer Use', 'Desktop Automation']
  },
  {
    id: 'mock-8',
    title: 'Real-time Screen Streaming with WebRTC',
    description: 'Socket.IO screen capture and streaming pipeline',
    messages: new Array(42).fill(null).map((_, i) => ({
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: 'Message content ' + i,
      timestamp: new Date()
    })),
    createdAt: '2026-02-16T14:30:00Z',
    updatedAt: '2026-02-16T17:00:00Z',
    bulgariаnTopic: 'Имплементация на реално-времево стрийминг на екрана с Socket.IO и оптимизирано компресиране на изображения за минимална латентност.',
    artifacts: ['server/socket/handlers.js', 'src/context/SocketContext.jsx', 'src/pages/ComputerControl.jsx'],
    firstQuestion: 'How do I stream a Linux desktop screen in real-time over WebSocket with minimal latency?',
    tags: ['WebRTC', 'Socket.IO', 'Streaming', 'Screen Capture']
  },
  {
    id: 'mock-9',
    title: 'Prompt Generator with Bulgarian Templates',
    description: 'Building AI prompt templates with multilingual support',
    messages: new Array(38).fill(null).map((_, i) => ({
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: 'Message content ' + i,
      timestamp: new Date()
    })),
    createdAt: '2026-02-14T10:00:00Z',
    updatedAt: '2026-02-14T12:15:00Z',
    bulgariаnTopic: 'Създаване на генератор за AI промпти с шаблони на български и английски език, с категории за различни задачи и персонализация.',
    artifacts: ['src/pages/PromptGenerator.jsx', 'prompts/bg-templates.md', 'prompts/en-templates.md'],
    firstQuestion: 'I need a prompt generator that supports both Bulgarian and English templates for different AI tasks.',
    tags: ['Prompts', 'Bulgarian', 'Templates', 'Multilingual']
  },
  {
    id: 'mock-10',
    title: 'Supabase Database Schema Design',
    description: 'Designing tables for sessions, logs, and user data',
    messages: new Array(34).fill(null).map((_, i) => ({
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: 'Message content ' + i,
      timestamp: new Date()
    })),
    createdAt: '2026-02-12T09:00:00Z',
    updatedAt: '2026-02-12T11:10:00Z',
    bulgariаnTopic: 'Проектиране на схема за Supabase PostgreSQL база данни за съхранение на сесии, системни логове, потребителски данни и конфигурации.',
    artifacts: ['supabase/schema.sql', 'supabase/migrations/', 'server/db.js'],
    firstQuestion: 'Help me design a Supabase database schema that supports sessions, logs, and multi-tenant user data.',
    tags: ['Supabase', 'PostgreSQL', 'Schema', 'Database Design']
  }
];

// Helper: parse sessions from localStorage + enrich with analysis
function loadAndRankSessions() {
  let sessions = [];
  try {
    const raw = localStorage.getItem('claudeSessions');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        sessions = parsed;
      }
    }
  } catch {
    // ignore parse errors
  }

  if (sessions.length === 0) {
    sessions = MOCK_SESSIONS;
  }

  // Enrich and sort by message count (longest session = most messages)
  return sessions
    .map(s => {
      const msgCount = Array.isArray(s.messages) ? s.messages.length : 0;
      const createdMs = s.createdAt ? new Date(s.createdAt).getTime() : 0;
      const updatedMs = s.updatedAt ? new Date(s.updatedAt).getTime() : 0;
      const durationMs = updatedMs - createdMs;
      const durationMin = Math.max(1, Math.round(durationMs / 60000));

      // Extract first user question from messages
      const firstUserMsg = Array.isArray(s.messages)
        ? s.messages.find(m => m.role === 'user')
        : null;
      const firstQuestion =
        s.firstQuestion ||
        (firstUserMsg ? String(firstUserMsg.content).slice(0, 120) + (String(firstUserMsg.content).length > 120 ? '…' : '') : 'Неизвестен въпрос');

      // Bulgarian topic fallback
      const bulgarianTopic =
        s.bulgariаnTopic ||
        s.bulgariаnTopic || // typo variant
        s.description ||
        'Разговор с Claude AI за автоматизация и разработка на софтуер.';

      // Artifacts from session or derived from messages
      const artifacts = s.artifacts || extractArtifacts(s.messages);

      return {
        ...s,
        msgCount,
        durationMin,
        firstQuestion,
        bulgarianTopic,
        artifacts
      };
    })
    .sort((a, b) => b.msgCount - a.msgCount)
    .slice(0, 10);
}

// Simple artifact extractor – looks for file paths in messages
function extractArtifacts(messages) {
  if (!Array.isArray(messages)) return [];
  const filePattern = /\b[\w./\\-]+\.(jsx?|tsx?|json|md|yml|yaml|sql|sh|py|css)\b/g;
  const found = new Set();
  for (const msg of messages) {
    const content = String(msg?.content || '');
    const matches = content.match(filePattern) || [];
    matches.forEach(m => found.add(m));
    if (found.size >= 5) break;
  }
  return [...found].slice(0, 5);
}

// Rank badge colors
const RANK_STYLES = [
  'from-amber-400 to-yellow-500',   // 1st – gold
  'from-slate-300 to-slate-400',    // 2nd – silver
  'from-amber-600 to-orange-700',   // 3rd – bronze
  'from-blue-500 to-cyan-600',
  'from-purple-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-rose-500 to-pink-600',
  'from-cyan-500 to-blue-600',
  'from-violet-500 to-purple-600',
  'from-green-500 to-emerald-600'
];

const TAG_ICONS = {
  React: Code,
  'Socket.IO': Globe,
  Android: Smartphone,
  ADB: Terminal,
  Database: Database,
  Supabase: Database,
  PostgreSQL: Database,
  Linux: Terminal,
  Security: Layers,
  Automation: Cpu,
  default: Hash
};

function getTagIcon(tag) {
  return TAG_ICONS[tag] || TAG_ICONS.default;
}

function formatDuration(minutes) {
  if (minutes < 60) return `${minutes} мин`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}ч ${m}мин` : `${h}ч`;
}

export default function TopSessionsAccordion() {
  const [sessions, setSessions] = useState([]);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    setSessions(loadAndRankSessions());
  }, []);

  const toggle = (id) => setOpenId(prev => (prev === id ? null : id));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.85 }}
      className="card-ultra relative overflow-hidden"
    >
      {/* Ambient gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/3 via-transparent to-purple-500/3 pointer-events-none" />

      <div className="relative">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
            <span className="text-gradient-primary">Топ 10 Най-Дълги Сесии</span>
          </h2>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-semibold text-amber-400">Claude Code Sessions</span>
          </div>
        </div>

        {/* Accordion list */}
        <div className="space-y-3">
          {sessions.map((session, index) => {
            const isOpen = openId === session.id;
            const rankGradient = RANK_STYLES[index] || RANK_STYLES[RANK_STYLES.length - 1];

            return (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-xl border border-white/5 overflow-hidden"
              >
                {/* Accordion header – always visible */}
                <motion.button
                  onClick={() => toggle(session.id)}
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
                  whileTap={{ scale: 0.995 }}
                  className="w-full p-3 sm:p-4 flex items-center gap-3 sm:gap-4 text-left bg-dark-900/50 group"
                >
                  {/* Rank badge */}
                  <div
                    className={`flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br ${rankGradient} rounded-lg flex items-center justify-center shadow-md`}
                  >
                    <span className="text-xs sm:text-sm font-bold text-white">#{index + 1}</span>
                  </div>

                  {/* Title & meta */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm sm:text-base truncate group-hover:text-primary-400 transition-colors">
                      {session.title}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-dark-400">
                        <MessageSquare className="w-3 h-3" />
                        {session.msgCount} съобщения
                      </span>
                      <span className="flex items-center gap-1 text-xs text-dark-400">
                        <Clock className="w-3 h-3" />
                        {formatDuration(session.durationMin)}
                      </span>
                    </div>
                  </div>

                  {/* Chevron */}
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="flex-shrink-0 text-dark-500 group-hover:text-primary-400 transition-colors"
                  >
                    <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.div>
                </motion.button>

                {/* Accordion body – animated */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-2 bg-dark-950/40 border-t border-white/5 space-y-4">

                        {/* Bulgarian topic description */}
                        <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
                          <div className="flex items-start gap-2">
                            <BookOpen className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-semibold text-blue-400 mb-1 uppercase tracking-wide">
                                Разглеждана тема
                              </p>
                              <p className="text-sm text-dark-300 leading-relaxed">
                                {session.bulgarianTopic}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* First question */}
                        <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
                          <div className="flex items-start gap-2">
                            <Search className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-semibold text-purple-400 mb-1 uppercase tracking-wide">
                                Първи въпрос
                              </p>
                              <p className="text-sm text-dark-300 italic leading-relaxed">
                                "{session.firstQuestion}"
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Artifacts */}
                        {session.artifacts && session.artifacts.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-dark-400 mb-2 flex items-center gap-1 uppercase tracking-wide">
                              <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                              Разгледани артефакти
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {session.artifacts.map((artifact, i) => (
                                <motion.span
                                  key={i}
                                  initial={{ opacity: 0, scale: 0.85 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: i * 0.04 }}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-mono"
                                >
                                  <FileCode className="w-3 h-3" />
                                  {artifact}
                                </motion.span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Tags */}
                        {session.tags && session.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {session.tags.map((tag, i) => {
                              const TagIcon = getTagIcon(tag);
                              return (
                                <span
                                  key={i}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-dark-800 border border-white/5 text-xs text-dark-400"
                                >
                                  <TagIcon className="w-2.5 h-2.5" />
                                  {tag}
                                </span>
                              );
                            })}
                          </div>
                        )}

                        {/* Stats row */}
                        <div className="flex items-center gap-4 pt-1 border-t border-white/5">
                          <span className="text-xs text-dark-500">
                            Създадена: {session.createdAt ? new Date(session.createdAt).toLocaleDateString('bg-BG', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                          </span>
                          <span className="text-xs text-dark-500">
                            Последна промяна: {session.updatedAt ? new Date(session.updatedAt).toLocaleDateString('bg-BG', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {sessions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-16 h-16 bg-dark-800/50 rounded-full flex items-center justify-center mb-4"
            >
              <MessageSquare className="w-8 h-8 text-dark-600" />
            </motion.div>
            <p className="text-dark-500 text-sm">Няма запазени сесии</p>
            <p className="text-dark-600 text-xs mt-1">Започнете чат с Claude за да се появят сесиите тук</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
