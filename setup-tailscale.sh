#!/bin/bash

# Wallestars Tailscale Setup Script
# This script automates the installation of Tailscale on your server.

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}==============================================${NC}"
echo -e "${BLUE}    🦎 Wallestars Tailscale Setup Helper     ${NC}"
echo -e "${BLUE}==============================================${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${YELLOW}Please run this script with sudo:${NC}"
  echo "sudo ./setup-tailscale.sh"
  exit 1
fi

echo -e "${GREEN}1. Checking Tailscale installation...${NC}"
if command -v tailscale &> /dev/null; then
    echo -e "${GREEN}✅ Tailscale is already installed!${NC}"
else
    echo -e "${GREEN}Downloading and installing Tailscale...${NC}"
    curl -fsSL https://tailscale.com/install.sh | sh
fi

echo -e "${GREEN}2. Authenticating Tailscale...${NC}"
echo "You will be asked to visit a URL to log in."
tailscale up

# Get Tailscale IP
TS_IP=$(tailscale ip -4)

echo ""
echo -e "${BLUE}==============================================${NC}"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo -e "Your Tailscale IP address is: ${YELLOW}${TS_IP}${NC}"
echo ""
echo "You can now access Wallestars from your other Tailscale devices at:"
echo -e "${BLUE}http://${TS_IP}:3000${NC}"
echo "(or http://${TS_IP} if you have Nginx configured on port 80)"
echo ""
echo -e "${BLUE}==============================================${NC}"
