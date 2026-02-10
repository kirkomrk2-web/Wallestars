# CLAUDE.md

> Reference guide for AI assistants working in the Wallestars Control Center codebase.

## Project Overview

Wallestars Control Center is a full-stack Node.js + React platform for Claude AI automation on Linux and Android. It provides real-time desktop control, Android device automation via ADB, AI-powered document scanning, prompt generation, and Hostinger VPS management.

## Quick Reference

```bash
# Install dependencies (--legacy-peer-deps is REQUIRED)
npm install --legacy-peer-deps

# Development (starts both server and client concurrently)
npm run dev

# Run only the backend (Express on port 3000)
npm run server

# Run only the frontend (Vite on port 5173)
npm run client

# Build for production
npm run build

# Run tests
npm run test            # single run
npm run test:ci         # with coverage
npm run test:watch      # watch mode

# Validate environment variables
npm run validate-env

# Start production server
npm start
```

## Tech Stack

| Layer     | Technology                                                  |
|-----------|-------------------------------------------------------------|
| Frontend  | React 18, Vite 5, Tailwind CSS 3.4, Framer Motion, Socket.IO Client |
| Backend   | Node.js 20+, Express 4, Socket.IO 4, better-sqlite3        |
| AI        | Anthropic SDK (`@anthropic-ai/sdk` 0.30.1) - Claude Sonnet |
| Testing   | Vitest 4, React Testing Library, jsdom                      |
| Deployment| Netlify, GitHub Pages, Hostinger VPS (PM2), Azure Web Apps  |
| CI/CD     | GitHub Actions (Node 20.x + 22.x matrix)                   |

## Project Structure

```
├── server/                  # Express.js backend
│   ├── index.js             # Entry point (port 3000)
│   ├── routes/              # API route handlers
│   │   ├── claude.js        # /api/claude/* - AI chat + computer use
│   │   ├── computerUse.js   # /api/computer/* - Linux desktop control
│   │   ├── android.js       # /api/android/* - ADB device control
│   │   ├── documentScanner.js # /api/document-scanner/* - Smart Scan
│   │   ├── hostinger.js     # /api/hostinger/* - VPS management
│   │   ├── n8nWebhooks.js   # /api/webhooks/n8n/* - Workflow integration
│   │   └── sse.js           # /sse/* - Server-sent events for MCP
│   ├── middleware/
│   │   └── auth.js          # Role-based auth (Admin/Operator/Viewer)
│   ├── services/
│   │   ├── permissions.js   # RBAC with Antigravity integration
│   │   └── hostingerClient.js
│   ├── socket/
│   │   └── handlers.js      # WebSocket event handlers
│   └── tests/               # Backend tests (vitest, node environment)
├── src/                     # React frontend
│   ├── main.jsx             # React entry point
│   ├── App.jsx              # Root component with page routing
│   ├── components/          # Shared UI components
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   ├── ThemeSettings.jsx
│   │   └── PlatformLinks.jsx
│   ├── pages/               # Page-level components
│   │   ├── Dashboard.jsx
│   │   ├── ClaudeChat.jsx
│   │   ├── ComputerControl.jsx
│   │   ├── AndroidControl.jsx
│   │   ├── SmartScan.jsx
│   │   ├── PromptGenerator.jsx
│   │   ├── HostingerManagement.jsx
│   │   ├── QRScanner.jsx
│   │   └── Settings.jsx
│   ├── context/             # React context providers
│   │   ├── SocketContext.jsx # WebSocket connection management
│   │   └── ThemeContext.jsx  # Dark mode state
│   ├── utils/               # Utility functions
│   └── tests/               # Frontend tests (vitest, jsdom)
├── antigravity-integration/ # Security RBAC system
├── n8n-workflows/           # N8N automation workflow configs
├── netlify/                 # Netlify serverless functions
├── prompts/                 # Prompt templates
├── public/                  # Static assets (CNAME, _redirects)
├── supabase/                # Supabase configuration
└── .github/workflows/       # CI/CD pipelines
```

## Architecture & Conventions

### Module System
- **ES Modules** throughout (`"type": "module"` in package.json). Use `import`/`export`, not `require`.

### Frontend Patterns
- **No router library** - page navigation uses `useState('activePage')` in `App.jsx` with a `pages` object mapping keys to components.
- **Context providers** wrap the app: `ThemeProvider` > `SocketProvider` > UI.
- **Styling**: Tailwind CSS utility classes. Custom theme colors defined in `tailwind.config.js` under `primary`, `accent`, and `dark` palettes.
- **Animations**: Framer Motion for page transitions (`AnimatePresence` + `motion.div`). Custom Tailwind keyframes for glow, float, shimmer, slide effects.
- **Icons**: Lucide React (`lucide-react`).
- **State management**: React hooks (`useState`, `useContext`). No Redux or external state library.

### Backend Patterns
- **Route organization**: Each feature has its own router in `server/routes/`. Routers are mounted in `server/index.js`.
- **Authentication middleware** (`server/middleware/auth.js`) runs on all `/api` routes and assigns roles:
  - `admin`: Valid `sk-ant-*` (Anthropic) or `ws-*` (Wallestars) API key in `Authorization: Bearer` header.
  - `operator`: Request from localhost (`127.0.0.1`, `::1`) or Tailscale IP range (`100.64.0.0/10`).
  - `viewer`: All other unauthenticated external requests (read-only).
- **WebSocket**: Socket.IO handles real-time screen streaming, action logging, and system metrics.
- **Database**: SQLite via `better-sqlite3` for local persistence.

### API Endpoints
- `GET /api/health` - Health check with service availability
- `/api/claude/*` - Claude AI chat and computer use
- `/api/computer/*` - Linux desktop automation (xdotool)
- `/api/android/*` - Android device control (ADB)
- `/api/document-scanner/*` - Document classification and extraction
- `/api/hostinger/*` - VPS management
- `/api/webhooks/n8n/*` - N8N workflow integration
- `/sse/*` - Server-sent events for MCP SuperAssistant

### Vite Dev Server Proxy
In development, Vite (port 5173) proxies `/api` and `/socket.io` to the Express server (port 3000). This is configured in `vite.config.js`.

## Testing

### Configuration
- **Frontend tests**: `vitest.config.js` - jsdom environment, setup in `src/tests/setup.js`
- **Backend tests**: `server/vitest.config.js` - node environment
- Tests are in `src/tests/` (frontend) and `server/tests/` (backend)
- Coverage: v8 provider, reporters: text, json, html

### Running Tests
```bash
npm run test          # Run all tests once
npm run test:ci       # Run with coverage report
npm run test:watch    # Watch mode
```

### Test Patterns
- Frontend: React Testing Library with jsdom. Browser APIs (matchMedia, ResizeObserver, IntersectionObserver) are mocked in `src/tests/setup.js`.
- Backend: Vitest with `vi.mock()` for module mocking. Auth middleware tests verify role assignment for different IP sources and API keys.

## CI/CD

GitHub Actions pipelines in `.github/workflows/`:

| Workflow | Trigger | What it does |
|----------|---------|--------------|
| `ci.yml` | Push to main, PRs | Tests (Node 20+22), security audit, build |
| `deploy-github-pages.yml` | Push to main | Build and deploy to GitHub Pages |
| `deploy-hostinger-vps.yml` | Manual/push | Deploy to Hostinger VPS with PM2 |
| `azure-webapps-node.yml` | Push | Deploy to Azure Web Apps |
| `testing-automation.yml` | Push/PR | Extended test suite |
| `pr-automation.yml` | PR events | Auto-labeling and checks |

**CI install command**: `npm ci --legacy-peer-deps` (the `--legacy-peer-deps` flag is required to resolve peer dependency conflicts).

## Environment Variables

Copy `.env.example` to `.env`. Key variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | For AI features | Claude API key (`sk-ant-*`) |
| `WALLESTARS_API_KEY` | For agent auth | Custom API key (`ws-*`) |
| `PORT` | No (default: 3000) | Server port |
| `NODE_ENV` | No (default: development) | Environment |
| `ENABLE_COMPUTER_USE` | No | Enable Linux desktop control |
| `ENABLE_ANDROID` | No | Enable Android ADB control |
| `HOSTINGER_API_TOKEN` | For VPS mgmt | Hostinger API token |
| `N8N_WEBHOOK_URL` | For workflows | N8N server URL |

The `validate-env.js` script runs automatically before `npm start` to check required variables.

## Important Notes

- **Node.js 20+ is required** (`"engines": { "node": ">=20.x" }`).
- **Always use `--legacy-peer-deps`** when running `npm install` or `npm ci`. This is due to peer dependency conflicts between some devDependencies.
- **Linting is not yet configured** - `npm run lint` is a no-op placeholder.
- The project uses a custom domain (`workmail.pro`) via CNAME in `public/`.
- PM2 is used for production process management (`ecosystem.config.js`).
- The frontend build output goes to `dist/` and is served as static files by Express in production.
- Bulgarian language support is present in several features (Smart Scan exports, prompt generator, documentation).
