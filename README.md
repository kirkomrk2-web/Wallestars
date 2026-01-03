# 🌟 Wallestars Control Center

<div align="center">

![Wallestars Banner](https://img.shields.io/badge/Wallestars-Control_Center-0ea5e9?style=for-the-badge)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-43853d?style=flat-square&logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.2-61dafb?style=flat-square&logo=react)](https://reactjs.org/)
[![Claude AI](https://img.shields.io/badge/Claude-Sonnet_4.5-8b5cf6?style=flat-square)](https://anthropic.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**Professional platform for Claude AI automation on Linux and Android**

*Beautiful real-time visualization • Computer Use • Device Control*

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [API](#-api-documentation)

</div>

---

## 🎯 Overview

**Wallestars Control Center** is a cutting-edge platform that brings Claude AI's powerful capabilities to Linux desktop control and Android device automation. With a beautiful, professional UI and real-time visualization, you can:

- 💬 Chat with Claude AI using the latest Sonnet 4.5 model
- 🖥️ Control your Linux desktop with Computer Use API
- 📱 Automate Android devices via ADB
- 📊 Monitor system metrics in real-time
- 🎨 Enjoy a stunning, responsive interface

---

## ✨ Features

### 🤖 Claude AI Integration
- **Claude Sonnet 4.5** - Latest AI model with advanced reasoning
- **Chat Interface** - Beautiful conversational UI
- **Computer Use** - AI-powered desktop automation
- **Vision Capabilities** - Screenshot analysis and action planning

### 🖥️ Linux Computer Use
- **Screen Streaming** - Real-time desktop visualization
- **Mouse Control** - Click, drag, and interact via `xdotool`
- **Keyboard Input** - Type text and press keys
- **System Information** - Monitor hostname, uptime, memory
- **Safe Command Execution** - Whitelisted shell commands

### 📱 Android Control
- **ADB Integration** - Control devices via Android Debug Bridge
- **Screenshot Capture** - View device screen in real-time
- **Touch Simulation** - Tap, swipe, and interact
- **Text Input** - Type on device keyboard
- **Navigation** - Home, Back, Power buttons
- **Device Info** - Model, Android version, battery level

### 🎨 Professional UI/UX
- **Modern Design** - Tailwind CSS with custom components
- **Smooth Animations** - Framer Motion for fluid transitions
- **Responsive Layout** - Works on all screen sizes
- **Dark Theme** - Easy on the eyes with glassmorphism effects
- **Real-time Updates** - WebSocket for live data streaming

---

## 🚀 Installation

### Prerequisites

- **Node.js** 20.x or higher
- **npm** or **yarn**
- **Anthropic API Key** ([Get one here](https://console.anthropic.com))
- **Linux** (for Computer Use features)
  - `xdotool` installed: `sudo apt install xdotool`
- **Android SDK Platform Tools** (for Android control)
  - `adb` available in PATH

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Wallesters-org/Wallestars.git
   cd Wallestars
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your Anthropic API key:
   ```env
   ANTHROPIC_API_KEY=sk-ant-your-key-here
   ENABLE_COMPUTER_USE=true
   ENABLE_ANDROID=true
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   ```
   http://localhost:5173
   ```

---

## 📖 Usage

### Dashboard
- View system metrics and activity logs
- Quick access to all features
- Real-time status indicators

### Claude Chat
1. Navigate to "Claude Chat"
2. Type your message in the input field
3. Press Enter or click Send
4. Receive intelligent responses from Claude Sonnet 4.5

### Computer Use (Linux)
1. Go to "Computer Use" page
2. Click "Start Stream" to view your desktop
3. Use AI Control to automate tasks
4. Or use Quick Actions for manual control

### Android Control
1. Connect your Android device via ADB
2. Navigate to "Android Control"
3. Select your device from the dropdown
4. Take screenshots to view device screen
5. Use Navigation controls or Quick Actions

---

## 🛠️ Development

### Scripts

```bash
npm run dev          # Start both server and client
npm run server       # Start backend only
npm run client       # Start frontend only
npm run build        # Build for production
npm start            # Start production server
```

---

## 🚢 Deployment

### 📚 Comprehensive Deployment Documentation

This project includes complete deployment guides for multiple platforms:

- **[Azure Web Apps](./docs/AZURE_DEPLOYMENT.md)** - PaaS deployment with GitHub Actions
- **[Docker + VPS](./docs/DOCKER_VPS_DEPLOYMENT.md)** - Self-hosted on Ubuntu Pro
- **[Architecture](./docs/ARCHITECTURE_DIAGRAMS.md)** - System diagrams and flows

### 🚀 Quick Deploy

**Azure Web Apps:**
```bash
# Setup GitHub secret AZURE_WEBAPP_PUBLISH_PROFILE
git push origin main  # Auto-deploys via GitHub Actions
```

**Docker on VPS:**
```bash
docker compose up -d --build
```

See [docs/README.md](./docs/README.md) for detailed instructions.

---

## 📄 License

MIT License

---

<div align="center">

**Built with ❤️ by Wallestars Team**

⭐ Star us on GitHub if you find this useful!

</div>