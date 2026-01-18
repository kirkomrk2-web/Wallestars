#!/bin/bash
# VPS Health Monitor Script
# Sends health metrics to n8n webhook every time it runs
# Install: crontab -e → */30 * * * * /path/to/vps-health-monitor.sh

WEBHOOK_URL="https://n8n.srv1201204.hstgr.cloud/webhook/vps-health"

# Collect metrics (using tr to remove newlines)
DISK=$(df -h / | awk 'NR==2{print $5}' | tr -d '%' | tr -d '\n')
MEM=$(free | awk 'NR==2{printf "%.0f", $3/$2*100}' | tr -d '\n')
CPU=$(cat /proc/loadavg | cut -d' ' -f1 | tr -d '\n')
DOCKER=$(systemctl is-active docker 2>/dev/null | head -1 | tr -d '\n')
[ -z "$DOCKER" ] && DOCKER="unknown"

# Create JSON payload
JSON="{\"disk\": ${DISK}, \"mem\": ${MEM}, \"cpu\": ${CPU}, \"docker\": \"${DOCKER}\"}"

# Send to n8n
RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d "$JSON" "$WEBHOOK_URL")

echo "[$(date)] Health check sent: disk=${DISK}% mem=${MEM}% cpu=${CPU} docker=${DOCKER}"
echo "Response: $RESPONSE"
