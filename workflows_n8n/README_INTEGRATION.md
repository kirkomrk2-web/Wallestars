# 📋 N8N Workflows Integration Guide

## 🆕 New Workflows Added from Claude Artifacts

**Date**: 2026-01-17  
**Source**: Claude Chat Analysis  
**Purpose**: Enhanced monitoring and automation

---

## 📁 Workflow Files

### 1. vps-health-monitoring.json
**Purpose**: Monitor VPS health every 5 minutes  
**Source**: Claude artifacts  
**Status**: Ready for import (needs adaptation)

**Features:**
- Check disk usage (alert >80%)
- Check memory usage (alert >85%)
- Check CPU load (alert >4.0)
- Check Docker status
- Check Wallestars app status
- Send alerts to Slack/Telegram
- Create Linear issues for critical problems
- Log to Supabase

**Adaptations Needed:**
```
1. Replace Telegram nodes with Slack nodes
2. Update Slack credential reference
3. Configure Supabase credential
4. Set LINEAR_TEAM_ID environment variable
5. Update alert messages for Slack format
```

**Required Credentials:**
- Slack Bot Token (already configured)
- Supabase PostgreSQL
- Linear API (if using Linear alerts)

**Required Tables:**
- vps_health_logs (see supabase/migrations/20260117_monitoring_tables.sql)

**Webhook**: None (scheduled every 5 minutes)

---

### 2. dashboard-data-collection.json
**Purpose**: Collect metrics from all platforms every 15 minutes  
**Source**: Claude artifacts  
**Status**: Ready for import (needs configuration)

**Features:**
- Collect n8n workflow statistics
- Collect Linear issues status
- Collect GitHub recent commits
- Collect PM2 application status
- Collect Docker container status
- Query health logs (last 24h)
- Aggregate all data
- Store snapshot in Supabase
- Expose via webhook API

**Adaptations Needed:**
```
1. Set environment variables:
   - GITHUB_USER: kirkomrk2-web
   - GITHUB_REPO: Wallestars
2. Configure n8n API credential (self-access)
3. Configure GitHub API credential
4. Configure Linear API credential
5. Configure Supabase credential
```

**Required Credentials:**
- n8n API (create in n8n Settings → API)
- GitHub API (Personal Access Token)
- Linear API (from Linear Settings → API)
- Supabase PostgreSQL

**Required Tables:**
- dashboard_snapshots (see migration file)
- vps_health_logs (for historical data query)

**Webhook**: `/webhook/dashboard-data` (POST)
**Response**: JSON with all dashboard metrics

---

### 3. vps-automation-hub.json
**Purpose**: General VPS operations via webhook  
**Source**: Claude artifacts  
**Status**: Ready for import

**Features:**
- Accept webhook requests for VPS operations
- Route actions (health_check, deploy, restart, etc.)
- Check Docker services
- Check disk space
- Check memory
- Aggregate results
- Return status

**Webhook**: `/webhook/vps-automation` (POST)

**Example Usage:**
```bash
curl -X POST https://n8n.srv1201204.hstgr.cloud/webhook/vps-automation \
  -H "Content-Type: application/json" \
  -d '{"action": "health_check"}'
```

**Required Credentials:** None (uses local commands)

---

### 4. simplify_workflows.json (Already Exists)
**Purpose**: MCP server for n8n workflows  
**Source**: Current deployment  
**Status**: ✅ Already deployed

**Features:**
- Expose n8n workflows as MCP tools
- Dynamic workflow management (add/remove/list/search/execute)
- Redis memory for tracking available workflows
- AI agent can discover and use workflows

**Already Configured** ✅

---

## 🔧 INTEGRATION STEPS

### Step 1: Run Supabase Migration

```bash
cd /home/administrator/Documents/Projects/Wallestars

# Apply migration
supabase db push

# Or manually in Supabase SQL Editor:
# Copy content from supabase/migrations/20260117_monitoring_tables.sql
# Execute in SQL Editor
```

**Verify:**
```sql
-- Check tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('vps_health_logs', 'dashboard_snapshots', 'github_linear_sync_log');

-- Check view exists
SELECT * FROM system_health_summary;

-- Check test data
SELECT * FROM vps_health_logs ORDER BY created_at DESC LIMIT 5;
SELECT * FROM dashboard_snapshots ORDER BY created_at DESC LIMIT 5;
```

---

### Step 2: Import Workflows to n8n

**Method 1: Via n8n UI**
1. Open https://n8n.srv1201204.hstgr.cloud
2. Click "Workflows" → "Add workflow" → "Import from File"
3. Upload workflow JSON file
4. Review imported workflow
5. **Do not activate yet** - configure credentials first

**Method 2: Via n8n API**
```bash
# Get your n8n API key from: Settings → API

N8N_API_KEY="your-api-key-here"
N8N_URL="https://n8n.srv1201204.hstgr.cloud"

# Import workflow
curl -X POST "$N8N_URL/api/v1/workflows/import" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -H "Content-Type: application/json" \
  -d @workflows_n8n/vps-health-monitoring.json
```

---

### Step 3: Configure Credentials in n8n

**A. Slack Credential** (already exists)
- Name: "Slack"
- Bot Token: xoxb-... (from .env: SLACK_BOT_TOKEN)

**B. Supabase/PostgreSQL Credential**
```
1. n8n → Settings → Credentials → Add Credential
2. Type: PostgreSQL
3. Name: "Supabase"
4. Host: db.ansiaiuaygcfztabtknl.supabase.co
5. Database: postgres
6. User: postgres
7. Password: [from .env: SUPABASE_SERVICE_ROLE_KEY or connection string]
8. Port: 5432
9. SSL: Enabled
10. Test connection
11. Save
```

**C. n8n API Credential** (for dashboard collection)
```
1. n8n → Settings → API → Create API Key
2. Name: "dashboard-self-access"
3. Copy the key

4. Credentials → Add → n8n API
5. Name: "n8n API"
6. API Key: [paste key from step 3]
7. Base URL: https://n8n.srv1201204.hstgr.cloud
8. Save
```

**D. Linear API Credential** (optional)
```
1. Linear → Settings → API → Personal API Keys
2. Create key: "n8n-monitoring"
3. Copy key

4. In n8n: Add → Linear API
5. Name: "Linear"
6. API Key: [paste]
7. Save
```

**E. GitHub API Credential** (for dashboard collection)
```
1. GitHub → Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Name: "n8n-dashboard"
4. Scopes: repo (all), read:org
5. Copy token

6. In n8n: Add → GitHub API
7. Name: "GitHub"
8. Access Token: [paste]
9. Save
```

---

### Step 4: Configure Environment Variables in n8n

```
Settings → Environment Variables:

Add:
- GITHUB_USER: kirkomrk2-web
- GITHUB_REPO: Wallestars
- LINEAR_TEAM_ID: 1eb31411-c06d-45e4-b268-12c463470fb8
```

---

### Step 5: Update Workflow Nodes

**VPS Health Monitoring:**
1. Open imported workflow
2. Find "Send Telegram Alert" node
3. Delete it
4. Add "Slack" node (type: "Send Message")
5. Connect from "Has Alerts?" (true branch)
6. Configure:
   - Credential: Select "Slack"
   - Channel: Select channel or use ID
   - Message: 
     ```
     🚨 VPS Health Alert
     
     Status: {{$json.health_status}}
     Time: {{$json.timestamp}}
     
     Metrics:
     • Disk: {{$json.vps.disk_usage_percent}}%
     • Memory: {{$json.vps.memory_usage_percent}}%
     • CPU Load: {{$json.vps.cpu_load}}
     • Docker: {{$json.vps.docker_status}}
     • Wallestars: {{$json.vps.wallestars_status}}
     
     Alerts ({{$json.alert_count}}):
     {{$json.alerts.map(a => `• [${a.severity.toUpperCase()}] ${a.message}`).join('\n')}}
     ```
7. Save workflow

**Dashboard Data Collection:**
1. Open imported workflow
2. Assign credentials to each node:
   - "Get n8n Workflows" → n8n API
   - "Get Linear Issues" → Linear (optional, can skip)
   - "Get GitHub Commits" → GitHub
   - "Get Health Logs" → Supabase
   - "Save Dashboard Snapshot" → Supabase
   - "Get Latest Snapshot" → Supabase
3. If Linear not used: Delete or disable "Get Linear Issues" node
4. Save workflow

---

### Step 6: Test Workflows

**Test VPS Health Monitoring:**
```
1. In n8n, open "VPS Health Monitoring" workflow
2. Click "Execute Workflow" button
3. Wait for completion
4. Check:
   - ✅ All nodes green (success)
   - ✅ Data inserted in Supabase (vps_health_logs table)
   - ✅ Slack message received (if alerts present)
5. If successful, toggle "Active" switch
```

**Test Dashboard Data Collection:**
```
1. Open "Dashboard Data Collection" workflow
2. Click "Execute Workflow" button
3. Check execution log for errors
4. Verify data in dashboard_snapshots table
5. Test webhook:
   curl -X POST https://n8n.srv1201204.hstgr.cloud/webhook/dashboard-data
6. Should return JSON with dashboard metrics
7. If successful, toggle "Active"
```

---

### Step 7: Verify Data Collection

**Check Supabase Tables:**
```sql
-- VPS health logs (should have recent entries)
SELECT * FROM vps_health_logs 
ORDER BY created_at DESC 
LIMIT 10;

-- Dashboard snapshots (should update every 15 min)
SELECT timestamp, data->'vps'->>'hostname' as vps, 
       data->'workflows'->>'total' as workflows
FROM dashboard_snapshots 
ORDER BY created_at DESC 
LIMIT 5;

-- System health summary
SELECT * FROM system_health_summary;
```

**Check Slack:**
- Verify alerts channel receives health notifications
- Test /hello command still works

---

## 🎯 POST-INTEGRATION TASKS

### 1. Update Documentation
- [x] Create this README
- [ ] Update ORCHESTRATION_DASHBOARD.md
- [ ] Add monitoring section to main README
- [ ] Document webhook endpoints

### 2. Schedule Maintenance
```bash
# Optional: Schedule cleanup in n8n (monthly)
# Create workflow with Schedule Trigger (monthly)
# Execute SQL: SELECT cleanup_old_health_logs();
# Execute SQL: SELECT cleanup_old_dashboard_snapshots();
```

### 3. Create Dashboard Frontend (Optional)
```
Use dashboard-data webhook to build HTML dashboard:
https://n8n.srv1201204.hstgr.cloud/webhook/dashboard-data

Or integrate with Grafana using JSON data source
```

---

## 🚨 TROUBLESHOOTING

### Issue: Workflow fails with "Credential not found"
**Solution**: 
1. Check credential name matches workflow node config
2. Verify credential is saved in n8n
3. Re-select credential in workflow node

### Issue: Supabase connection fails
**Solution**:
1. Verify connection string in .env
2. Test connection: 
   ```bash
   psql "postgresql://postgres:[PASSWORD]@db.ansiaiuaygcfztabtknl.supabase.co:5432/postgres"
   ```
3. Check SSL is enabled in credential

### Issue: VPS health check commands fail
**Solution**:
1. Verify n8n has execute permissions
2. Check Docker is installed on VPS
3. Verify PM2 is installed and has wallestars app

### Issue: Dashboard webhook returns errors
**Solution**:
1. Check workflow is active
2. Verify all credentials configured
3. Check n8n execution log for specific error
4. Some nodes can fail gracefully (e.g., if Linear not configured)

---

## 📊 EXPECTED METRICS

### After Integration:

**VPS Health:**
- Checks: Every 5 minutes (288/day)
- Data retention: 30 days (~8,640 records)
- Alert latency: <5 minutes
- Storage: ~1-2 MB/month

**Dashboard:**
- Snapshots: Every 15 minutes (96/day)
- Data retention: 90 days (~8,640 snapshots)
- Webhook response: <2 seconds
- Storage: ~10-20 MB/month

**Total Supabase Impact:**
- Additional storage: ~12-22 MB/month
- Additional queries: ~400/day
- Well within free tier limits ✅

---

## ✅ SUCCESS CRITERIA

Workflows are considered successfully integrated when:

1. ✅ Supabase tables exist and accept data
2. ✅ VPS health monitoring runs every 5 minutes
3. ✅ Slack alerts received for test scenarios
4. ✅ Dashboard data collection runs every 15 minutes
5. ✅ Webhook `/webhook/dashboard-data` returns valid JSON
6. ✅ No errors in n8n execution logs
7. ✅ system_health_summary view shows current data

---

## 🎯 NEXT STEPS

After successful integration:

1. **Monitor for 24 hours**
   - Verify no errors
   - Check Slack alerts
   - Review collected data

2. **Optimize thresholds**
   - Adjust alert thresholds based on normal usage
   - Fine-tune check intervals if needed

3. **Build dashboard frontend** (optional)
   - Use webhook API data
   - Create HTML dashboard
   - Deploy to VPS or Netlify

4. **Consider additional workflows** (optional)
   - GitHub-Linear sync
   - Multi-agent task management
   - Advanced analytics

---

**Integration Guide Version**: 1.0  
**Last Updated**: 2026-01-17 21:27 EET  
**Status**: Ready for deployment 🚀