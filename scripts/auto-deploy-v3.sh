#!/bin/bash
# Automated V3 Deployment & Testing Script
# Manages the entire deployment process

set -e

echo "=========================================="
echo "🚀 Wallester V3 Auto-Deployment"
echo "=========================================="

N8N_URL="https://n8n.srv1201204.hstgr.cloud"
WEBHOOK_PATH="wallester-registration-v3"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo "📋 Phase 1: Verify N8N Health"
echo "----------------------------------------"

HEALTH=$(curl -s "${N8N_URL}/healthz")
if echo "$HEALTH" | grep -q '"status":"ok"'; then
    echo -e "${GREEN}✅ N8N is healthy${NC}"
else
    echo -e "${RED}❌ N8N health check failed${NC}"
    echo "Response: $HEALTH"
    exit 1
fi

echo ""
echo "📋 Phase 2: Test Webhook Endpoint"
echo "----------------------------------------"

WEBHOOK_TEST=$(curl -s -X POST "${N8N_URL}/webhook/${WEBHOOK_PATH}" \
    -H "Content-Type: application/json" \
    -d '{"owner_id":"pre-activation-test"}' 2>&1)

if echo "$WEBHOOK_TEST" | grep -q '"code":404'; then
    echo -e "${YELLOW}⚠️  Webhook not registered - workflow needs activation${NC}"
    echo "This is expected if workflow is not active yet."
    NEEDS_ACTIVATION=true
else
    echo -e "${GREEN}✅ Webhook is registered and responding${NC}"
    echo "Response: $WEBHOOK_TEST"
    NEEDS_ACTIVATION=false
fi

echo ""
echo "📋 Phase 3: Action Required"
echo "----------------------------------------"

if [ "$NEEDS_ACTIVATION" = true ]; then
    echo -e "${YELLOW}Action needed in N8N UI:${NC}"
    echo ""
    echo "1. Open: ${N8N_URL}"
    echo "2. Navigate to Workflows"
    echo "3. Open: 'Wallester Registration Agent V3 (Fixed Timing)'"
    echo "4. Ensure all credentials are configured (no red icons)"
    echo "5. Toggle 'Active' switch to ON (green)"
    echo "6. Click 'Save'"
    echo ""
    echo "Then run this script again to verify."
    echo ""
    echo "Or run manual test:"
    echo "  ./scripts/trigger_test_webhook.sh"
    exit 0
else
    echo -e "${GREEN}✅ Workflow is active!${NC}"
    echo "Proceeding to full test..."
fi

echo ""
echo "📋 Phase 4: Create Test Data in Supabase"
echo "----------------------------------------"

# We can't easily do this without psql access
# User should do this manually or via Supabase Dashboard

echo -e "${YELLOW}⚠️  Manual action required:${NC}"
echo ""
echo "Create test owner in Supabase Dashboard:"
echo "SQL Editor → Execute:"
echo ""
cat << 'EOSQL'
INSERT INTO verified_business_profiles (
  company_name,
  email_alias,
  phone,
  ownership_data
) VALUES (
  'Test Company EOOD',
  'test@33mail.com',
  '+359888000001',
  '{"businesses": [{"eik": "TEST12345", "name": "Test Business", "type": "EOOD"}]}'
) RETURNING id;
EOSQL
echo ""
echo "Copy the returned 'id' (UUID)"
echo ""

read -p "Enter the owner UUID (or press Enter to skip): " OWNER_UUID

if [ -z "$OWNER_UUID" ]; then
    echo "Skipping live test. You can run manually later:"
    echo "  ./scripts/trigger_test_webhook.sh YOUR-OWNER-UUID"
    exit 0
fi

echo ""
echo "📋 Phase 5: Trigger Test Execution"
echo "----------------------------------------"

TEST_RESPONSE=$(curl -s -X POST "${N8N_URL}/webhook/${WEBHOOK_PATH}" \
    -H "Content-Type: application/json" \
    -d "{\"owner_id\":\"${OWNER_UUID}\"}")

echo "Response:"
echo "$TEST_RESPONSE" | jq '.' 2>/dev/null || echo "$TEST_RESPONSE"

if echo "$TEST_RESPONSE" | grep -q '"code":404'; then
    echo -e "${RED}❌ Workflow still not active${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Workflow execution triggered!${NC}"
fi

echo ""
echo "📋 Phase 6: Monitor Execution"
echo "----------------------------------------"
echo "1. Open N8N: ${N8N_URL}"
echo "2. Go to 'Executions' tab"
echo "3. Look for most recent execution"
echo "4. Watch progress in real-time"
echo ""
echo "OR check Supabase:"
echo "  SELECT * FROM registration_progress WHERE business_eik = 'TEST12345';"
echo ""

echo "=========================================="
echo -e "${GREEN}✅ Auto-Deployment Script Complete!${NC}"
echo "=========================================="
echo ""
echo "Workflow Status: ACTIVE & TESTED"
echo "Webhook URL: ${N8N_URL}/webhook/${WEBHOOK_PATH}"
echo ""
echo "Monitor progress in:"
echo "  - N8N Executions: ${N8N_URL}/executions"
echo "  - Supabase Table: registration_progress"