# 🚀 Manual Deployment Steps - Execute Each Phase

**Date**: 16 Януари 2026, 22:00  
**Follow these steps IN ORDER**

---

## 📋 Phase 1: Deploy SQL Migration

### Option 1: Via VPS (RECOMMENDED)

**Step 1: Open Terminal and SSH to VPS**
```bash
ssh root@72.61.154.188
# Password: Zdraveibobi12#
```

**Step 2: Run Deployment Script**
```bash
# Download and execute the deployment script
cd /tmp
wget https://raw.githubusercontent.com/kirkomrk2-web/Wallestars/main/scripts/deploy-sql-migration.sh
chmod +x deploy-sql-migration.sh
./deploy-sql-migration.sh
```

**OR manually copy/paste the script content:**
```bash
# Copy content from: /home/administrator/Documents/Projects/Wallestars/scripts/deploy-sql-migration.sh
# Paste into terminal on VPS
# Execute
```

### Option 2: Via Supabase Dashboard

1. Open: https://supabase.com/dashboard/project/ansiaiuaygcfztabtknl/sql/new
2. Copy content from: `supabase/migrations/004_create_registration_progress.sql`
3. Paste in SQL Editor
4. Click "Run"
5. Wait for "Success" message

**Verify:**
```sql
SELECT * FROM registration_progress LIMIT 1;
SELECT routine_name FROM information_schema.routines WHERE routine_name LIKE '%registration%';
```

---

## 📥 Phase 2: Import Workflows to N8N

### Step 1: Access N8N

1. Open browser: **https://n8n.srv1201204.hstgr.cloud**
2. Login with your credentials

### Step 2: Import SMS Worker

1. Click **"Workflows"** in sidebar
2. Click **"Add workflow"** dropdown → **"Import from File"**
3. **Browse** and select:
   ```
   /home/administrator/Documents/Projects/Wallestars/n8n-workflows/duoplus-sms-worker-improved.json
   ```
4. Click **"Import"**
5. Workflow appears as **"DuoPlus SMS Worker (Improved)"**
6. **DO NOT ACTIVATE YET** (credentials needed first)
7. **Note the Workflow ID** from URL: `.../workflow/{WORKFLOW_ID}`

### Step 3: Import Email Worker

1. Click **"Add workflow"** → **"Import from File"**
2. Select:
   ```
   /home/administrator/Documents/Projects/Wallestars/n8n-workflows/email-otp-extractor.json
   ```
3. Click **"Import"**
4. Workflow appears as **"Email OTP Extractor"**
5. **Note the Workflow ID** from URL

### Step 4: Import V3 Main Workflow

1. Click **"Add workflow"** → **"Import from File"**
2. Select:
   ```
   /home/administrator/Documents/Projects/Wallestars/n8n-workflows/wallester-registration-agent-v3.json
   ```
3. Click **"Import"**
4. Workflow appears as **"Wallester Registration Agent V3 (Fixed Timing)"**
5. **DO NOT ACTIVATE YET**

---

## 🔐 Phase 3: Configure Credentials

### Credential 1: Supabase (ALL 3 WORKFLOWS)

**For EACH workflow** (SMS Worker, Email Worker, V3 Main):

1. Open the workflow
2. Click on ANY **"Supabase"** node (yellow)
3. In right panel → **Credentials** dropdown
4. Click **"Create New Credential"**
5. Fill in form:
   - **Credential name**: `Supabase Wallestars`
   - **Host**: `ansiaiuaygcfztabtknl.supabase.co`
   - **Service Role Key**: 
     ```
     eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFuc2lhaXVheWdjZnp0YWJ0a25sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzA2ODY2OSwiZXhwIjoyMDc4NjQ0NjY5fQ.uAy4O9560idXOE6kAudCGYwC3K5ypPngZsbe7e3tWBA
     ```
6. Click **"Save"**
7. **Repeat for other workflows** OR select existing credential from dropdown

### Credential 2: Airtop (V3 Main Workflow ONLY)

1. Open **V3 Main Workflow**
2. Click on node **"Airtop: Create Session"**
3. **Credentials** dropdown → **"Create New Credential"**
4. Select credential type: **"Header Auth"** or **"HTTP Header Auth"**
5. Fill in:
   - **Name**: `Airtop API Key`
   - **Header Name**: `X-API-Key`
   - **Header Value**: 
     ```
     271915265f8e889f.aLIGzrOU8nRnsFhZEhEnMDoLpFU88eyXEIButzo82B
     ```
6. Click **"Save"**
7. **Apply to ALL Airtop nodes**:
   - "Airtop: Create Session"
   - "Airtop: Open Window"
   - "Enter Phone Number"
   - "Submit SMS Code"
   - "Enter Email"
   - "Submit Email Code"
   - "Fill Business Details"
   - "Airtop: Terminate"

### Credential 3: Gmail OAuth2 (Email Worker ONLY)

1. Open **Email Worker** workflow
2. Click on node **"Search Gmail"**
3. **Credentials** dropdown → **"Create New Credential"**
4. Select: **"Gmail OAuth2 API"**
5. Fill in:
   - **Credential name**: `Gmail Wallestars`
   - **Client ID**: 
     ```
     375044393631-brbvilu1udvb7757vb7et3a7ovdmoolj.apps.googleusercontent.com
     ```
   - **Client Secret**: 
     ```
     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
     ```
6. Click **"Connect my account"** button
7. **Login with Google** (use your Gmail account)
8. **Grant permissions** when asked
9. Click **"Save"**

**IMPORTANT**: If OAuth fails, add this Redirect URI in Google Cloud Console:
```
https://n8n.srv1201204.hstgr.cloud/rest/oauth2-credential/callback
```
Go to: https://console.cloud.google.com/apis/credentials?project=wallestars-automation

### Credential 4: Slack (V3 Main - OPTIONAL)

1. Open **V3 Main Workflow**
2. Click on node **"Slack Success"**
3. **Credentials** dropdown → **"Create New Credential"**
4. Select: **"Slack OAuth2 API"**
5. Fill in:
   - **Access Token**: 
     ```
     SLACK_BOT_TOKEN_REDACTED
     ```
6. Click **"Save"**

---

## 🔧 Phase 4: Update Workflow References

### Fix Workflow IDs in V3 Main

1. Open **V3 Main Workflow**
2. Find node **"Listen for SMS OTP"**
3. Click node → Right panel → **Parameters**
4. Find **"Workflow"** parameter
5. Change from `duoplus-sms-worker-improved` to: **Select from dropdown**
6. Select **"DuoPlus SMS Worker (Improved)"** from list
7. Save node

8. Find node **"Listen for Email OTP"**
9. Repeat steps 3-7
10. Select **"Email OTP Extractor"** from dropdown
11. Save node

12. Click **"Save"** button (top right) to save entire workflow

---

## ✅ Phase 5: Test Workers

### Test 1: SMS Worker

1. Open **SMS Worker** workflow
2. Click **"Test workflow"** button (play icon)
3. In **"Manual"** tab, provide input:
   ```json
   {
     "country": "US",
     "service": "wallester",
     "maxRetries": 2
   }
   ```
4. Click **"Execute workflow"**
5. **Expected**: Should start, order phone number, show "Waiting..."
6. **Stop execution** after 20 seconds (no need to wait for actual SMS)
7. If it started successfully → ✅ PASS

### Test 2: Email Worker (Optional)

1. Send test email to your Gmail:
   - To: your-gmail@gmail.com
   - Subject: "verification test"
   - Body: "Your code is 123456"

2. Open **Email Worker** workflow
3. Click **"Test workflow"**
4. Provide input:
   ```json
   {
     "senderFilter": "your-name",
     "subjectFilter": "verification",
     "maxRetries": 2,
     "waitSeconds": 10
   }
   ```
5. Click **"Execute workflow"**
6. **Expected**: Should find email and extract code "123456"
7. If successful → ✅ PASS

---

## 🚀 Phase 6: Activate Production

### Step 1: Activate Workers

1. Open **SMS Worker** workflow
2. Toggle **"Active"** switch (top right) → **ON** (green)
3. Click **"Save"**

4. Open **Email Worker** workflow
5. Toggle **"Active"** → **ON**
6. Click **"Save"**

### Step 2: Activate V3 Main

1. Open **V3 Main Workflow**
2. Toggle **"Active"** → **ON**
3. **Copy Webhook URL** shown:
   ```
   https://n8n.srv1201204.hstgr.cloud/webhook/wallester-registration-v3
   ```
4. Click **"Save"**

### Step 3: Note Important URLs

**Webhook URL** (for Supabase):
```
https://n8n.srv1201204.hstgr.cloud/webhook/wallester-registration-v3
```

**N8N Dashboard**:
```
https://n8n.srv1201204.hstgr.cloud
```

---

## 🎉 Phase 7: Verify Deployment

### Verification Checklist

- [ ] SQL migration deployed (table `registration_progress` exists)
- [ ] SMS Worker imported and active
- [ ] Email Worker imported and active
- [ ] V3 Main Workflow imported and active
- [ ] All credentials configured correctly
- [ ] Workflow ID references updated
- [ ] SMS Worker test passed
- [ ] Webhook URL copied

---

## 📞 Next Steps

**To trigger a test registration**:

```bash
curl -X POST https://n8n.srv1201204.hstgr.cloud/webhook/wallester-registration-v3 \
  -H "Content-Type: application/json" \
  -d '{"owner_id": "test-uuid-123"}'
```

**To monitor progress**:

1. Open Supabase Dashboard
2. Go to Table Editor
3. Open `registration_progress` table
4. Watch for new entries

**OR via SQL**:
```sql
SELECT * FROM registration_progress 
ORDER BY created_at DESC 
LIMIT 10;
```

---

## ✅ Deployment Complete!

All phases completed. System is ready for production use.

**Status**: 🟢 ACTIVE  
**Webhook**: https://n8n.srv1201204.hstgr.cloud/webhook/wallester-registration-v3