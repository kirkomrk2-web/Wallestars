# 🔐 Step 3: Credential Configuration Guide

**Prerequisites**: Step 2 complete (all 3 workflows imported)  
**Time**: ~15-20 minutes  
**Date**: 16 Януари 2026, 22:12

---

## 🎯 Overview

You need to configure 4 types of credentials:
1. **Supabase** (for all 3 workflows)
2. **Airtop** (for V3 Main only)
3. **Gmail OAuth2** (for Email Worker only)
4. **Slack** (for V3 Main only - OPTIONAL)

---

## 📋 Credential 1: Supabase (V3 MAIN WORKFLOW ONLY)

**Correction**: The SMS and Email workers do NOT need Supabase credentials. Only the Main V3 Workflow does.

### Step 1: Open V3 Main Workflow

1. Go to: https://n8n.srv1201204.hstgr.cloud
2. Click **"Workflows"**
3. Click **"Wallester Registration Agent V3 (Fixed Timing)"**

### Step 2: Configure Supabase Credential

1. Find any **yellow "Supabase" node** (e.g., "Log Error" or "Mark as Completed") and click it.
2. In right panel → **Credentials** dropdown
3. Click **"+ Create New Credential"**
4. Fill in:

```
Credential Name: Supabase Wallestars
Host: ansiaiuaygcfztabtknl.supabase.co
Service Role Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFuc2lhaXVheWdjZnp0YWJ0a25sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzA2ODY2OSwiZXhwIjoyMDc4NjQ0NjY5fQ.uAy4O9560idXOE6kAudCGYwC3K5ypPngZsbe7e3tWBA
```

5. Click **"Save"**
6. **Apply this credential to ALL other Supabase nodes** in this workflow (~15 nodes).
   - Tip: Scroll through the workflow and check every yellow node.

### Step 3: (Skipped for Workers)
*You can ignore the instructions to add Supabase credentials to SMS and Email workers, as they don't use them.*

**✅ Checkpoint**: Supabase configured in V3 Main Workflow


---

## 🌐 Credential 2: Airtop (V3 MAIN ONLY)

### Step 1: Open V3 Main Workflow

1. Click **"Wallester Registration Agent V3"**

### Step 2: Configure Airtop for Each Node

**Nodes that need Airtop credentials** (8 total):
- Airtop: Create Session
- Airtop: Open Window
- Enter Phone Number
- Submit SMS Code
- Enter Email
- Submit Email Code
- Fill Business Details
- Airtop: Terminate

**For EACH node:**

1. Click the node
2. **Credentials** dropdown → **"+ Create New"** (first time) or **Select existing**
3. Choose credential type: **"Header Auth"** or **"HTTP Header Auth"**
4. Fill in:

```
Name: Airtop API Key
Header Name: X-API-Key
Header Value: 271915265f8e889f.aLIGzrOU8nRnsFhZEhEnMDoLpFU88eyXEIButzo82B
```

5. Click **"Save"**
6. **Reuse this credential** for all other Airtop nodes
7. Save workflow

**✅ Checkpoint**: Airtop configured on all 8 nodes

---

## 📧 Credential 3: Gmail OAuth2 (EMAIL WORKER ONLY)

### Step 1: Open Email Worker

1. Click **"Email OTP Extractor"**

### Step 2: Find Gmail Node

1. Look for node: **"Search Gmail"**
2. Click it

### Step 3: Configure Gmail OAuth2

1. **Credentials** dropdown → **"+ Create New"**
2. Select type: **"Gmail OAuth2 API"**
3. Fill in:

```
Name: Gmail Wallestars
Client ID: 375044393631-brbvilu1udvb7757vb7et3a7ovdmoolj.apps.googleusercontent.com
Client Secret: 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
```

4. Click **"Connect my account"** button
5. **Login with Google** → Use your Gmail account
6. **Allow permissions** when prompted
7. Click **"Save"**
8. Apply to "Mark as Read" node if present
9. Save workflow

**⚠️ Important**: If OAuth connection fails, verify:
- Redirect URI in Google Cloud Console: `https://n8n.srv1201204.hstgr.cloud/rest/oauth2-credential/callback`
- Go to: https://console.cloud.google.com/apis/credentials?project=wallestars-automation
- Edit OAuth client → Add redirect URI

**✅ Checkpoint**: Gmail OAuth2 connected successfully

---

## 💬 Credential 4: Slack (V3 MAIN - OPTIONAL)

### Step 1: Open V3 Main Workflow

1. Click **"Wallester Registration Agent V3"**

### Step 2: Find Slack Nodes

- "Slack Success"
- "Slack Error"

### Step 3: Configure Slack

1. Click "Slack Success" node
2. **Credentials** dropdown → **"+ Create New"**
3. Select type: **"Slack OAuth2 API"**
4. Fill in:

```
Name: Slack Wallestars
Access Token: SLACK_BOT_TOKEN_REDACTED
```

5. Click **"Save"**
6. Apply to "Slack Error" node
7. Save workflow

**Note**: Slack is optional - if skipped, you won't get Slack notifications but workflow will still work.

**✅ Checkpoint**: Slack configured (or skipped)

---

## ✅ Final Verification

### Check All Credentials:

Open each workflow and verify no red warning icons on nodes:

1. **SMS Worker**: All nodes green/gray (no red)
2. **Email Worker**: All nodes green/gray (no red)
3. **V3 Main**: All nodes green/gray (no red)

### Test Credential Connection:

1. Open any workflow
2. Click a node with credentials
3. Look for **"Test Connection"** or green checkmark
4. If red X → credential is wrong, re-configure

---

## 📝 Completion Checklist

- [ ] Supabase credential created and applied to SMS Worker
- [ ] Supabase credential applied to Email Worker
- [ ] Supabase credential applied to V3 Main (all ~15 nodes)
- [ ] Airtop credential created and applied to all 8 nodes in V3
- [ ] Gmail OAuth2 connected for Email Worker
- [ ] Slack configured (or deliberately skipped)
- [ ] All workflows show no red warning icons
- [ ] All workflows saved

**When all checked** → Step 3 is COMPLETE → Ready for Step 4!

---

## 🆘 Troubleshooting

### "Cannot find credential type"
- Make sure n8n has required integrations installed
- Update n8n to latest version if needed

### "OAuth connection failed"
- Check redirect URI in Google Cloud Console
- Make sure URL exactly matches: `https://n8n.srv1201204.hstgr.cloud/rest/oauth2-credential/callback`
- Try clearing browser cache and retry

### "Invalid Service Role Key"
- Double-check no extra spaces when copying
- Verify key starts with: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`

### "Node still shows red"
- Click node → Check error message
- Re-create credential if needed
- Make sure credential is actually selected (not empty)

---

## ⏭️ Next: Step 4

Once Step 3 complete → Proceed to **Step 4: Update Workflow References**