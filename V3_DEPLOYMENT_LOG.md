# 🚀 V3 Deployment Log - Live Progress

**Started**: 16 Януари 2026, 21:43  
**Status**: 🟡 IN PROGRESS

---

## ✅ Phase 1: Database Setup

### Step 1.1: Deploy SQL Migration to Supabase
**Status**: 🔵 Starting...

**Command**:
```bash
psql "postgresql://postgres.ansiaiuaygcfztabtknl:Zdraveibobi12#@aws-0-eu-central-1.pooler.supabase.com:6543/postgres" -f supabase/migrations/004_create_registration_progress.sql
```

**Expected Result**: 
- Table `registration_progress` created
- 4 helper functions created
- Row Level Security enabled

---

## ⏳ Phase 2: Import Workflows to N8N (Pending)

### Step 2.1: SSH to VPS
### Step 2.2: Import SMS Worker
### Step 2.3: Import Email Worker  
### Step 2.4: Import Main V3 Workflow

---

## ⏳ Phase 3: Configure Credentials (Pending)

### Step 3.1: Supabase
### Step 3.2: Airtop
### Step 3.3: Gmail OAuth2
### Step 3.4: Slack
### Step 3.5: DuoPlus

---

## ⏳ Phase 4: Testing (Pending)

---

## 📝 Gmail OAuth2 Setup Instructions

**Къде да вземеш Client Secret:**

1. Отвори Google Cloud Console (снимката която изпрати)
2. **APIs and Services** → **Credentials** (в меню вляво)
3. Намери твоя OAuth 2.0 Client ID: `375044393631-3d12sla5k8v7uckjrtfo76ok2iogc162.apps.googleusercontent.com`
4. Кликни върху името на credential
5. Ще видиш екран с:
   - Client ID: `375044393631-3d12sla5k8v7uckjrtfo76ok2iogc162.apps.googleusercontent.com`
   - **Client Secret**: `GOCSPX-xxxxxxxxxxxxxxxxx` ← ТОВА ТИ ТРЯБВА
6. Копирай Client Secret-а
7. Също добави Redirect URI: `https://n8n.srv1201204.hstgr.cloud/rest/oauth2-credential/callback`

**Или използвай този бърз линк**:
```
https://console.cloud.google.com/apis/credentials?project=wallestars-automation
```