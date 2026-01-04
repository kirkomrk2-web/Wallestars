#!/bin/bash

# Wallestars WSL Setup Script
# This script helps configure Wallestars for use with Claude Desktop on Windows via WSL

set -e

echo "🪟 Wallestars WSL Configuration Setup"
echo "====================================="
echo ""

# Detect if running in WSL
if ! grep -qi microsoft /proc/version; then
    echo "⚠️  This script is designed for WSL (Windows Subsystem for Linux)"
    echo "   It appears you're not running in WSL."
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Setup cancelled."
        exit 1
    fi
else
    echo "✅ WSL environment detected"
fi

echo ""

# Get WSL username and home directory
WSL_USER=$(whoami)
WSL_HOME=$HOME
echo "WSL Username: $WSL_USER"
echo "WSL Home: $WSL_HOME"
echo ""

# Get current directory
WALLESTARS_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "Wallestars path: $WALLESTARS_PATH"
echo ""

# Check if we're in /mnt/c (Windows filesystem)
if [[ "$WALLESTARS_PATH" == /mnt/* ]]; then
    echo "⚠️  WARNING: Wallestars is located on Windows filesystem ($WALLESTARS_PATH)"
    echo "   This may cause performance issues."
    echo ""
    echo "📋 Recommendation:"
    echo "   1. Clone Wallestars to WSL filesystem (e.g., ~/Wallestars)"
    echo "   2. Run this setup script from there"
    echo ""
    echo "   Quick commands:"
    echo "   cd ~"
    echo "   git clone https://github.com/Wallesters-org/Wallestars.git"
    echo "   cd Wallestars"
    echo "   ./setup-wsl.sh"
    echo ""
    read -p "Continue with current location? (not recommended) (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Setup cancelled. Please relocate to WSL filesystem first."
        exit 1
    fi
fi

# Windows user detection
echo "Detecting Windows username..."
if [ -d "/mnt/c/Users" ]; then
    # Try to find Windows username
    WIN_USERS=($(ls /mnt/c/Users/ | grep -v -E "Public|Default|All Users|desktop.ini"))
    if [ ${#WIN_USERS[@]} -eq 1 ]; then
        WIN_USER="${WIN_USERS[0]}"
        echo "✅ Windows username detected: $WIN_USER"
    elif [ ${#WIN_USERS[@]} -gt 1 ]; then
        echo "Multiple Windows users found:"
        for i in "${!WIN_USERS[@]}"; do
            echo "  $((i+1)). ${WIN_USERS[$i]}"
        done
        read -p "Enter the number of your Windows username: " user_choice
        WIN_USER="${WIN_USERS[$((user_choice-1))]}"
        echo "Selected: $WIN_USER"
    else
        read -p "Enter your Windows username: " WIN_USER
    fi
else
    read -p "Enter your Windows username: " WIN_USER
fi
echo ""

# Claude Desktop config path
CLAUDE_CONFIG_DIR="/mnt/c/Users/$WIN_USER/AppData/Roaming/Claude"
CLAUDE_CONFIG_FILE="$CLAUDE_CONFIG_DIR/claude_desktop_config.json"

echo "Claude Desktop config path: $CLAUDE_CONFIG_FILE"
echo ""

# Check if Claude Desktop is installed
if [ ! -d "$CLAUDE_CONFIG_DIR" ]; then
    echo "⚠️  Claude Desktop config directory not found."
    echo "   Expected: $CLAUDE_CONFIG_DIR"
    echo ""
    echo "   Please ensure:"
    echo "   1. Claude Desktop is installed on Windows"
    echo "   2. You've run it at least once"
    echo "   3. Your Windows username ($WIN_USER) is correct"
    echo ""
    read -p "Would you like to create the directory? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        mkdir -p "$CLAUDE_CONFIG_DIR"
        echo "✅ Created directory: $CLAUDE_CONFIG_DIR"
        echo ""
    else
        echo "❌ Setup cancelled."
        exit 1
    fi
fi

# Check if config file exists and offer backup
if [ -f "$CLAUDE_CONFIG_FILE" ]; then
    echo "⚠️  Existing Claude Desktop config found"
    echo ""
    read -p "Would you like to create a backup? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        BACKUP_FILE="${CLAUDE_CONFIG_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
        cp "$CLAUDE_CONFIG_FILE" "$BACKUP_FILE"
        echo "✅ Backup created: $BACKUP_FILE"
        echo ""
    fi
fi

# Check dependencies
echo "Checking WSL dependencies..."
MISSING_DEPS=()

if ! command -v node &> /dev/null; then
    MISSING_DEPS+=("nodejs")
fi

if ! command -v xdotool &> /dev/null; then
    MISSING_DEPS+=("xdotool")
fi

if [ ${#MISSING_DEPS[@]} -gt 0 ]; then
    echo "⚠️  Missing dependencies: ${MISSING_DEPS[*]}"
    echo ""
    read -p "Would you like to install them now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        sudo apt update
        
        for dep in "${MISSING_DEPS[@]}"; do
            if [ "$dep" = "nodejs" ]; then
                echo "Installing Node.js 20.x..."
                curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
                sudo apt install -y nodejs
            else
                echo "Installing $dep..."
                sudo apt install -y "$dep"
            fi
        done
        
        echo "✅ Dependencies installed"
        echo ""
    else
        echo "⚠️  Warning: Missing dependencies may cause issues"
        echo ""
    fi
else
    echo "✅ All dependencies are installed"
    echo ""
fi

# Get API key from user
echo "Configuration:"
echo "-------------"
read -p "Enter your Anthropic API Key (or press Enter to use .env file): " API_KEY

if [ -z "$API_KEY" ]; then
    if [ -f "$WALLESTARS_PATH/.env" ]; then
        # Extract API key from .env file
        API_KEY=$(grep "^ANTHROPIC_API_KEY=" "$WALLESTARS_PATH/.env" | cut -d '=' -f2- | sed 's/^["'"'"']//' | sed 's/["'"'"']$//')
        if [ -n "$API_KEY" ]; then
            echo "✅ Using API key from .env file"
        else
            echo "⚠️  No API key found in .env file"
            API_KEY="sk-ant-your-api-key-here"
        fi
    else
        echo "⚠️  No .env file found"
        API_KEY="sk-ant-your-api-key-here"
    fi
fi

# Ask about features
echo ""
read -p "Enable Computer Use (Linux/WSL desktop control)? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    ENABLE_COMPUTER_USE="true"
else
    ENABLE_COMPUTER_USE="false"
fi

echo ""
read -p "Enable Android Control (via ADB)? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    ENABLE_ANDROID="true"
else
    ENABLE_ANDROID="false"
fi

# Create the configuration
echo ""
echo "Creating Claude Desktop configuration for WSL..."
echo ""

# Generate configuration with WSL-specific command
cat > "$CLAUDE_CONFIG_FILE" << EOF
{
  "mcpServers": {
    "wallestars-control": {
      "command": "wsl",
      "args": [
        "bash",
        "-c",
        "cd $WALLESTARS_PATH && node server/index.js"
      ],
      "env": {
        "ANTHROPIC_API_KEY": "$API_KEY",
        "PORT": "3000",
        "NODE_ENV": "production",
        "ENABLE_COMPUTER_USE": "$ENABLE_COMPUTER_USE",
        "ENABLE_ANDROID": "$ENABLE_ANDROID",
        "SCREENSHOT_INTERVAL": "2000",
        "ADB_HOST": "localhost",
        "ADB_PORT": "5037",
        "WS_PORT": "3001"
      }
    }
  }
}
EOF

echo "✅ Configuration created successfully!"
echo ""

# Install npm dependencies if not already installed
if [ ! -d "$WALLESTARS_PATH/node_modules" ]; then
    echo "Installing npm dependencies..."
    cd "$WALLESTARS_PATH"
    npm install
    echo "✅ Dependencies installed"
    echo ""
fi

# Create .env file if it doesn't exist
if [ ! -f "$WALLESTARS_PATH/.env" ]; then
    echo "Creating .env file..."
    cp "$WALLESTARS_PATH/.env.example" "$WALLESTARS_PATH/.env"
    
    # Update .env with API key if provided
    if [ "$API_KEY" != "sk-ant-your-api-key-here" ]; then
        sed -i "s/your_api_key_here/$API_KEY/" "$WALLESTARS_PATH/.env"
    fi
    
    echo "✅ .env file created"
    echo ""
fi

# Display summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Setup Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Wallestars location: $WALLESTARS_PATH"
echo "✅ Configuration file: $CLAUDE_CONFIG_FILE"
echo "✅ Computer Use: $ENABLE_COMPUTER_USE"
echo "✅ Android Control: $ENABLE_ANDROID"
echo ""

# Display WSL-specific information
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🪟 WSL-Specific Information"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Accessing project from Windows:"
echo "  File Explorer: \\\\wsl.localhost\\Ubuntu$WSL_HOME\\Wallestars"
echo "  VS Code: code $WALLESTARS_PATH"
echo ""
echo "Starting server manually:"
echo "  cd $WALLESTARS_PATH"
echo "  npm start"
echo ""
echo "Testing from Windows browser:"
echo "  http://localhost:3000"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📖 Next Steps"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Restart Claude Desktop on Windows"
echo ""
echo "2. Test the connection by asking Claude:"
echo "   • 'Take a screenshot'"
echo "   • 'What is my system information?'"
echo ""
echo "3. Access web UI from Windows:"
echo "   • Open http://localhost:3000 in your browser"
echo ""
echo "4. For more details, see:"
echo "   • WSL_SETUP.md (WSL-specific guide)"
echo "   • MCP_SETUP.md (General MCP setup)"
echo "   • README.md (Project overview)"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 WSL Setup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
