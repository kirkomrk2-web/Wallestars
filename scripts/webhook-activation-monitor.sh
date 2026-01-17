#!/bin/bash
# Webhook Activation Monitor - Retry Loop
# Polls webhook until it becomes active

N8N_URL="https://n8n.srv1201204.hstgr.cloud"
WEBHOOK_PATH="wallester-registration-v3"
MAX_RETRIES=60  # 10 minutes (60 * 10s)
RETRY_DELAY=10  # seconds

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔄 Starting webhook activation monitor..."
echo "Polling: ${N8N_URL}/webhook/${WEBHOOK_PATH}"
echo "Max retries: ${MAX_RETRIES} (every ${RETRY_DELAY}s)"
echo ""

for i in $(seq 1 $MAX_RETRIES); do
    echo -n "[$i/$MAX_RETRIES] Checking... "
    
    RESPONSE=$(curl -s -X POST "${N8N_URL}/webhook/${WEBHOOK_PATH}" \
        -H "Content-Type: application/json" \
        -d '{"owner_id":"monitor-test"}' 2>&1)
    
    if echo "$RESPONSE" | grep -q '"code":404'; then
        echo -e "${YELLOW}⏳ Not active yet${NC}"
        sleep $RETRY_DELAY
    else
        echo -e "${GREEN}✅ WEBHOOK ACTIVE!${NC}"
        echo ""
        echo "Activation detected at: $(date)"
        echo "Response: $RESPONSE" | head -3
        echo ""
        echo "✅ Proceeding to post-deployment tasks..."
        exit 0
    fi
done

echo ""
echo "⚠️  Timeout: Webhook still not active after $((MAX_RETRIES * RETRY_DELAY)) seconds"
echo "Please check n8n UI manually."
exit 1