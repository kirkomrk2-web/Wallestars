#!/bin/bash
echo "Triggering Wallester Registration Workflow..."
curl -X POST "https://n8n.srv1201204.hstgr.cloud/webhook/supabase-verified-owner" \
  -H "Content-Type: application/json" \
  -d '{
    "record": {
      "first_name": "Test",
      "last_name": "User",
      "company_name": "Test Corp",
      "vat_number": "123456789",
      "email": "test@wallestars.eu"
    },
    "type": "INSERT",
    "table": "verified_owners",
    "schema": "public"
  }'
echo -e "\nDone."
