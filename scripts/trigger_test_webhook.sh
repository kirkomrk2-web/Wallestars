#!/bin/bash
# Test Script for Wallester Registration Agent V3
# Usage: ./trigger_test_webhook.sh [owner_id]

WEBHOOK_URL="https://n8n.srv1201204.hstgr.cloud/webhook/wallester-registration-v3"
OWNER_ID="${1:-test-uuid-$(date +%s)}"

echo "🚀 Triggering V3 Registration Workflow..."
echo "📍 URL: $WEBHOOK_URL"
echo "👤 Owner ID: $OWNER_ID"

response=$(curl -s -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "{\"owner_id\": \"$OWNER_ID\", \"test_mode\": true}")

echo ""
echo "📥 Response:"
echo "$response"
echo ""
echo "Status check (if JSON):"
echo "$response" | grep -o '"message":[^,]*' || echo "Raw response received"
