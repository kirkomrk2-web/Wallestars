# 🚀 V3 Complete Deployment Guide

**Date**: 16 Януари 2026, 21:52  
**Status**: Ready for Manual Deployment

---

## 📋 Prerequisites Checklist

### ✅ All Credentials Available:

1. **Supabase**:
   - URL: `https://ansiaiuaygcfztabtknl.supabase.co`
   - Service Role Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFuc2lhaXVheWdjZnp0YWJ0a25sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzA2ODY2OSwiZXhwIjoyMDc4NjQ0NjY5fQ.uAy4O9560idXOE6kAudCGYwC3K5ypPngZsbe7e3tWBA`
   - Project: `ansiaiuaygcfztabtknl`

2. **Airtop**:
   - API Key: `271915265f8e889f.aLIGzrOU8nRnsFhZEhEnMDoLpFU88eyXEIButzo82B`

3. **Gmail OAuth2**:
   - Client ID: `375044393631-brbvilu1udvb7757vb7et3a7ovdmoolj.apps.googleusercontent.com`
   - Client Secret: `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`

4. **Slack**:
   - Bot Token: `SLACK_BOT_TOKEN_REDACTED`

5. **DuoPlus**:
   - API Key: `0b6e4995-719b-483c-80d6-d370c96b0469` (already in workflows)

6. **VPS/N8N**:
   - SSH: `ssh root@72.61.154.188`
   - Password: `Zdraveibobi12#`
   - N8N URL: `https://n8n.srv1201204.hstgr.cloud`

---

## 🗄️ Phase 1: Deploy SQL Migration to Supabase

### Option A: Via Supabase Dashboard (RECOMMENDED)

1. **Open Supabase SQL Editor**:
   ```
   https://supabase.com/dashboard/project/ansiaiuaygcfztabtknl/sql/new
   ```

2. **Copy SQL Migration Content**:
   - Open file: `/home/administrator/Documents/Projects/Wallestars/supabase/migrations/004_create_registration_progress.sql`
   - Copy entire content

3. **Execute in SQL Editor**:
   - Paste the SQL
   - Click "Run" button
   - Wait for success message

4. **Verify**:
   ```sql
   -- Check table exists
   SELECT * FROM registration_progress LIMIT 1;
   
   -- Check functions exist
   SELECT routine_name 
   FROM information_schema.routines 
   WHERE routine_name LIKE '%registration%';
   ```

### Option B: Via VPS SSH

```bash
# SSH to VPS
ssh root@72.61.154.188
# Password: Zdraveibobi12#

# Install psql if needed
apt-get update && apt-get install -y postgresql-client

# Run migration
cd /tmp
cat > migration.sql << 'EOF'
[PASTE CONTENT OF 004_create_registration_progress.sql HERE]
EOF

# Execute
PGPASSWORD='Zdraveibobi12#' psql "postgresql://postgres:Zdraveibobi12#@db.ansiaiuaygcfztabtknl.supabase.co:5432/postgres" -f migration.sql
```

---

## 📥 Phase 2: Import Workflows to N8N

### Step 2.1: Access N8N

1. Open browser: `https://n8n.srv1201204.hstgr.cloud`
2. Login with your credentials

### Step 2.2: Import SMS Worker

1. **In N8N**: Workflows → Import from File
2. **Select**: `/home/administrator/Documents/Projects/Wallestars/n8n-workflows/duoplus-sms-worker-improved.json`
3. **Import** → Workflow imported
4. **DO NOT ACTIVATE YET** (need credentials first)

### Step 2.3: Import Email Worker

1. **In N8N**: Workflows → Import from File
2. **Select**: `/home/administrator/Documents/Projects/Wallestars/n8n-workflows/email-otp-extractor.json`
3. **Import** → Workflow imported
4. **DO NOT ACTIVATE YET**

### Step 2.4: Import V3 Main Workflow

1. **In N8N**: Workflows → Import from File
2. **Select**: `/home/administrator/Documents/Projects/Wallestars/n8n-workflows/wallester-registration-agent-v3.json`
3. **Import** → Workflow imported
4. **DO NOT ACTIVATE YET**

---

## 🔐 Phase 3: Configure Credentials in N8N

### Credential 3.1: Supabase (ALL 3 WORKFLOWS)

**In each workflow** (SMS Worker, Email Worker, V3 Main):

1. Click on any **Supabase node**
2. Click on **Credentials** dropdown
3. Click **"+ Create New Credential"**
4. Fill in:
   - **Name**: `Supabase Wallestars`
   - **Host**: `ansiaiuaygcfztabtknl.supabase.co`
   - **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFuc2lhaXVheWdjZnp0YWJ0a25sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzA2ODY2OSwiZXhwIjoyMDc4NjQ0NjY5fQ.uAy4O9560idXOE6kAudCGYwC3K5ypPngZsbe7e3tWBA`
5. **Save**

### Credential 3.2: Airtop (V3 Main Workflow)

**In V3 Main Workflow**:

1. Click on any **Airtop HTTP Request node**
2. Click on **Credentials** dropdown → **HTTP Header Auth**
3. Click **"+ Create New Credential"**
4. Fill in:
   - **Name**: `Airtop API Key`
   - **Header Name**: `X-API-Key`
   - **Header Value**: `271915265f8e889f.aLIGzrOU8nRnsFhZEhEnMDoLpFU88eyXEIButzo82B`
5. **Save**
6. Apply to ALL Airtop nodes in workflow

### Credential 3.3: Gmail OAuth2 (Email Worker)

**In Email Worker Workflow**:

1. Click on **"Search Gmail"** node
2. Click on **Credentials** dropdown
3. Click **"+ Create New Credential"** → **Gmail OAuth2**
4. Fill in:
   - **Name**: `Gmail Wallestars`
   - **Client ID**: `375044393631-brbvilu1udvb7757vb7et3a7ovdmoolj.apps.googleusercontent.com`
   - **Client Secret**: `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`
5. **Click "Connect my Account"**
6. **Login with Google** account you want to use
7. **Grant permissions**
8. **Save**

**IMPORTANT**: Add Redirect URI in Google Cloud Console:
```
https://n8n.srv1201204.hstgr.cloud/rest/oauth2-credential/callback
```

### Credential 3.4: Slack (V3 Main Workflow) - OPTIONAL

**In V3 Main Workflow**:

1. Click on **"Slack Success"** or **"Slack Error"** node
2. Click on **Credentials** dropdown
3. Click **"+ Create New Credential"** → **Slack OAuth2**
4. Fill in:
   - **Name**: `Slack Wallestars`
   - **Access Token**: `SLACK_BOT_TOKEN_REDACTED`
5. **Save**

---

## ✅ Phase 4: Update Workflow References

### Fix 4.1: Update Credential IDs

After creating credentials, you need to update placeholder IDs in workflows:

**In each workflow**, replace these placeholder IDs:

- `SUPABASE_CRED_ID` → Your actual Supabase credential ID
- `AIRTOP_API_KEY` → Your actual Airtop credential ID  
- `YOUR_CREDENTIAL_ID` (Gmail) → Your actual Gmail credential ID
- `SLACK_CRED_ID` → Your actual Slack credential ID (optional)

**How to find credential IDs**:
1. N8N → Settings → Credentials
2. Click on credential name
3. URL will show ID: `.../credentials/edit/{CREDENTIAL_ID}`

### Fix 4.2: Update Workflow ID References

In **V3 Main Workflow**, update these nodes:

**"Listen for SMS OTP" node**:
- Parameter `workflowId`: Change to actual SMS Worker workflow ID
- Get ID from: Workflows → SMS Worker → URL shows `.../{WORKFLOW_ID}`

**"Listen for Email OTP" node**:
- Parameter `workflowId`: Change to actual Email Worker workflow ID

---

## 🧪 Phase 5: Testing

### Test 5.1: SMS Worker Standalone

1. Open **SMS Worker** workflow
2. Click **"Execute Workflow"** (test button)
3. Provide test input:
   ```json
   {
     "country": "US",
     "service": "wallester",
     "maxRetries": 3
   }
   ```
4. **Expected**: Should order phone and wait for SMS
5. **Cancel after 30s** if working (no need to wait for SMS)

### Test 5.2: Email Worker Standalone

1. Send test email to your Gmail
   - Subject: "verification"
   - Body: "Your code is 123456"
2. Open **Email Worker** workflow
3. Click **"Execute Workflow"**
4. Provide test input:
   ```json
   {
     "senderFilter": "your-test-email",
     "subjectFilter": "verification",
     "maxRetries": 2,
     "waitSeconds": 10
   }
   ```
5. **Expected**: Should find email and extract code `123456`

### Test 5.3: Database Connection Test

In Supabase SQL Editor:
```sql
-- Test insert
INSERT INTO registration_progress (
  business_eik, 
  business_name, 
  current_step, 
  status
) VALUES (
  'TEST123', 
  'Test Company', 
  'INITIATED', 
  'IN_PROGRESS'
) RETURNING *;

-- Test helper function
SELECT update_registration_step('TEST123', 'PHONE_NUMBER_ALLOCATED', 'IN_PROGRESS');

-- Check result
SELECT * FROM registration_progress WHERE business_eik = 'TEST123';

-- Clean up
DELETE FROM registration_progress WHERE business_eik = 'TEST123';
```

---

## 🚀 Phase 6: Activate Production

### Step 6.1: Activate Workers

1. **SMS Worker**: Click **"Active"** toggle → ON
2. **Email Worker**: Click **"Active"** toggle → ON

### Step 6.2: Activate V3 Main Workflow

1. **V3 Main Workflow**: Click **"Active"** toggle → ON
2. **Copy Webhook URL**: 
   ```
   https://n8n.srv1201204.hstgr.cloud/webhook/wallester-registration-v3
   ```

### Step 6.3: Configure Supabase Webhook

**Option A: Via Supabase Dashboard**:

1. Open: `https://supabase.com/dashboard/project/ansiaiuaygcfztabtknl/database/hooks`
2. **Create New Hook**:
   - **Table**: `verified_business_profiles`
   - **Events**: `INSERT`
   - **Type**: `HTTP Request`
   - **Method**: `POST`
   - **URL**: `https://n8n.srv1201204.hstgr.cloud/webhook/wallester-registration-v3`
   - **Headers**: `Content-Type: application/json`
   - **Payload**: 
     ```json
     {
       "owner_id": "{{ record.id }}"
     }
     ```
3. **Test Hook**
4. **Enable**

**Option B: Via SQL**:

```sql
-- Create webhook function
CREATE OR REPLACE FUNCTION trigger_wallester_registration()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://n8n.srv1201204.hstgr.cloud/webhook/wallester-registration-v3',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := json_build_object('owner_id', NEW.id)::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_owner_verified ON verified_business_profiles;
CREATE TRIGGER on_owner_verified
  AFTER INSERT ON verified_business_profiles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_wallester_registration();
```

---

## 📊 Phase 7: Monitor

### Monitoring Queries

```sql
-- See active registrations
SELECT 
  business_eik,
  business_name,
  current_step,
  status,
  EXTRACT(EPOCH FROM (NOW() - started_at))::INTEGER AS elapsed_seconds
FROM registration_progress
WHERE status IN ('IN_PROGRESS', 'WAITING_SMS', 'WAITING_EMAIL')
ORDER BY started_at DESC;

-- Success rate (last 24h)
SELECT 
  COUNT(*) FILTER (WHERE status = 'COMPLETED') AS completed,
  COUNT(*) FILTER (WHERE status = 'FAILED') AS failed,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'COMPLETED')::NUMERIC / 
    NULLIF(COUNT(*), 0) * 100, 
    2
  ) AS success_rate_percent
FROM registration_progress
WHERE created_at > NOW() - INTERVAL '24 hours';

-- Find stuck registrations
SELECT * FROM get_stuck_registrations(30);
```

### N8N Monitoring

1. **Executions** tab → See all workflow runs
2. **Filter by workflow** → V3 Main, SMS Worker, Email Worker
3. **Check errors** → Red = failed, Green = success

---

## 🐛 Troubleshooting

### Issue: "Workflow not found"

**Solution**: Update `workflowId` parameter in V3 Main workflow with actual worker IDs.

### Issue: "Invalid credentials"

**Solution**: Verify credentials are correctly configured and IDs match.

### Issue: "SMS timeout"

**Solution**: 
- Check DuoPlus API key is valid
- Verify `orderId` parameter is passed to SMS worker
- Check DuoPlus service name is correct ("wallester")

### Issue: "Email not found"

**Solution**:
- Verify Gmail OAuth2 is connected
- Check sender/subject filters
- Ensure email arrived before timeout

### Issue: "Registration stuck"

**Solution**:
```sql
-- Check error log
SELECT 
  business_eik,
  current_step,
  last_error,
  error_log
FROM registration_progress
WHERE status = 'IN_PROGRESS'
AND updated_at < NOW() - INTERVAL '30 minutes';

-- Manual intervention
UPDATE registration_progress
SET status = 'MANUAL_INTERVENTION_REQUIRED'
WHERE business_eik = 'STUCK_EIK';
```

---

## ✅ Deployment Checklist

- [ ] Phase 1: SQL migration deployed to Supabase
- [ ] Phase 2: All 3 workflows imported to n8n
- [ ] Phase 3: All credentials configured
- [ ] Phase 4: Workflow IDs updated
- [ ] Phase 5: Standalone tests passed
- [ ] Phase 6: Workflows activated
- [ ] Phase 7: Supabase webhook configured
- [ ] Phase 8: Monitoring queries tested

---

## 📞 Support

If issues persist, check:
- `CRITICAL_BUG_FIX_V3.md` - Timing sequence explanation
- `INTEGRATION_COMPLETE.md` - Full deployment guide
- `WORKFLOW_ANALYSIS.md` - Pattern references
- `TASK_COMPLETION_SUMMARY.md` - Complete overview

---

**Deployment Guide Complete**  
**Ready for Production**: Follow steps above  
**Estimated Time**: 30-45 minutes for full deployment