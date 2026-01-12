# N8N Workflow Template Implementation Checklist

Quick reference checklist for implementing recommended n8n workflow templates for Wallestars.

## Phase 1: Critical Infrastructure (Week 1) ⭐⭐⭐

### 1. Automated Daily Workflow Backup to GitHub
- [ ] **Get GitHub Personal Access Token**
  - Go to GitHub Settings > Developer settings > Personal access tokens
  - Scopes: `repo`, `workflow`, `read:org`
  - Save token securely

- [ ] **Configure n8n GitHub Credential**
  - Open n8n at https://n8n.srv1201204.hstgr.cloud
  - Go to Credentials > Add Credential > GitHub
  - Add token

- [ ] **Import Workflow Template**
  - Visit: https://n8n.io/workflows/4064-automated-daily-workflow-backup-to-github/
  - Click "Use this workflow"
  - Or manually create based on template

- [ ] **Configure Workflow Settings**
  - Set repository: `Wallesters-org/Wallestars`
  - Set path: `n8n-workflows/`
  - Set schedule: Daily at 3:00 AM UTC
  - Add commit message format: `[n8n] Automated workflow backup - {{date}}`

- [ ] **Test Workflow**
  - Run workflow manually
  - Verify files committed to GitHub
  - Check commit appears in repository

- [ ] **Activate Workflow**
  - Toggle workflow to active
  - Monitor first scheduled run
  - Verify in n8n execution logs

**Time Required**: 1-2 hours
**Priority**: HIGH

---

### 2. GitHub PR Linting with Google Gemini AI
- [ ] **Get Google Gemini API Key**
  - Visit: https://makersuite.google.com/app/apikey
  - Create free API key
  - Note: 60 requests per minute free tier

- [ ] **Configure n8n Gemini Credential**
  - Add credential in n8n
  - Type: HTTP Request with API key
  - Save API key

- [ ] **Import LintGuardian Template**
  - Visit: https://n8n.io/workflows/4073-automate-github-pr-linting-with-google-gemini-ai-and-auto-fix-prs/
  - Import to n8n

- [ ] **Configure PR Linting Rules**
  - Set to trigger on PRs to main branch only
  - Configure linting checks:
    - [ ] Security vulnerabilities
    - [ ] Code quality issues
    - [ ] Best practices
    - [ ] Documentation completeness

- [ ] **Set Up Webhook Integration**
  - Add webhook to GitHub repository
  - Event: Pull Request (opened, synchronize)
  - URL: `https://n8n.srv1201204.hstgr.cloud/webhook/pr-lint`

- [ ] **Test PR Linting**
  - Create test PR
  - Verify AI analysis appears as comment
  - Check suggestions are relevant

- [ ] **Activate Workflow**
  - Toggle workflow to active
  - Monitor PR events

**Time Required**: 2-3 hours
**Priority**: HIGH

---

### 3. Sync GitHub Workflows to n8n After PR Merges
- [ ] **Import Workflow Template**
  - Visit: https://n8n.io/workflows/4500-sync-github-workflows-to-n8n-after-pull-request-merges/
  - Import to n8n

- [ ] **Configure Sync Settings**
  - Repository: `Wallesters-org/Wallestars`
  - Monitor path: `n8n-workflows/*.json`
  - Auto-activate imported workflows: Yes/No (your choice)

- [ ] **Set Up PR Merge Webhook**
  - Event: Pull Request (closed with merged=true)
  - URL: `https://n8n.srv1201204.hstgr.cloud/webhook/workflow-sync`

- [ ] **Test Workflow Sync**
  - Create test workflow JSON in repo
  - Create PR and merge
  - Verify workflow appears in n8n

- [ ] **Activate Workflow**
  - Toggle workflow to active
  - Document sync behavior

**Time Required**: 2-3 hours
**Priority**: HIGH

---

### 4. Database Backup Automation (if using database)
- [ ] **Determine Database Type**
  - [ ] PostgreSQL
  - [ ] MySQL
  - [ ] SQLite
  - [ ] Other: __________

- [ ] **Choose Backup Strategy**
  - [ ] Option A: GitHub (for small databases)
  - [ ] Option B: AWS S3 (for larger databases)
  - [ ] Option C: Local + FTP

- [ ] **Set Up Storage Credentials**
  - If GitHub: Use existing token
  - If S3: Create AWS credentials
  - If FTP: Get FTP server details

- [ ] **Create Backup Workflow**
  - Based on template: https://n8n.io/workflows/6436
  - Schedule: Daily at 2:00 AM UTC
  - Retention: 30 days daily, then weekly for 3 months

- [ ] **Configure Backup Script**
  - Database dump command
  - Compression (gzip recommended)
  - Encryption (if sensitive data)

- [ ] **Test Backup & Restore**
  - Run backup manually
  - Download backup file
  - Test restore on local/test environment
  - Verify data integrity

- [ ] **Set Up Notifications**
  - Success: Log to Wallestars dashboard
  - Failure: Alert via email + dashboard

- [ ] **Activate Workflow**
  - Toggle workflow to active
  - Monitor first scheduled backup

**Time Required**: 2-4 hours
**Priority**: HIGH (if using database), N/A (if not)

---

## Phase 2: Enhanced Monitoring (Week 2) ⭐⭐

### 5. Enhanced PM2 Monitoring
- [ ] **Audit Current Health Monitor**
  - Open `system-health-monitor.json`
  - Review existing PM2 checks

- [ ] **Add Memory Leak Detection**
  - Track memory usage over time
  - Alert if memory increases consistently
  - Threshold: 50MB increase per hour

- [ ] **Add CPU Spike Detection**
  - Monitor CPU usage per process
  - Alert on sustained high CPU (>80% for >5 min)

- [ ] **Implement Restart Loop Prevention**
  - Track restart count
  - Prevent restart if >5 restarts in 10 minutes
  - Alert for manual intervention

- [ ] **Add PM2 Log Parsing**
  - Parse PM2 logs for errors
  - Extract error patterns
  - Send detailed error reports

- [ ] **Test Enhanced Monitoring**
  - Simulate high memory usage
  - Simulate CPU spikes
  - Verify alerts trigger correctly

- [ ] **Update Documentation**
  - Document new monitoring features
  - Update alert thresholds

**Time Required**: 3-4 hours
**Priority**: MEDIUM

---

### 6. Deployment Automation Workflow
- [ ] **Create Deployment Workflow**
  - Name: `deployment-automation.json`
  - Trigger: Webhook + manual execution

- [ ] **Add Pre-Deployment Checks**
  - [ ] Check all services are healthy
  - [ ] Verify no pending alerts
  - [ ] Check disk space availability
  - [ ] Validate environment variables

- [ ] **Implement Deployment Steps**
  - [ ] Git pull latest code
  - [ ] Run `npm install` (if needed)
  - [ ] Build production assets
  - [ ] PM2 reload services (zero-downtime)
  - [ ] Clear caches

- [ ] **Add Post-Deployment Verification**
  - [ ] Wait 30 seconds
  - [ ] Check health endpoints
  - [ ] Verify no errors in logs
  - [ ] Test critical API endpoints

- [ ] **Implement Rollback Mechanism**
  - Store previous version commit hash
  - On failure: Git checkout previous version
  - PM2 reload with old version
  - Alert team of rollback

- [ ] **Test Deployment Workflow**
  - Test successful deployment
  - Test failed deployment (rollback)
  - Verify notifications work

- [ ] **Activate Workflow**
  - Document deployment process
  - Share webhook URL with team

**Time Required**: 4-5 hours
**Priority**: MEDIUM

---

### 7. File Change Monitoring
- [ ] **Identify Critical Files**
  - [ ] `ecosystem.config.js` (PM2 config)
  - [ ] `.env` files
  - [ ] `nginx.conf` (if applicable)
  - [ ] `package.json`
  - [ ] Security-related files

- [ ] **Create Monitoring Workflow**
  - Import template: https://n8n.io/workflows/967
  - Schedule: Every 5 minutes

- [ ] **Configure File Watchers**
  - Calculate file hashes (MD5/SHA256)
  - Store hashes in workflow state
  - Compare on each run

- [ ] **Set Up Alert Rules**
  - Unauthorized changes: Critical alert
  - Authorized changes: Info log
  - Include file diff in alert

- [ ] **Test File Monitoring**
  - Modify a monitored file
  - Verify alert triggers
  - Check diff accuracy

- [ ] **Activate Workflow**
  - Toggle workflow to active
  - Document monitored files

**Time Required**: 2-3 hours
**Priority**: MEDIUM

---

### 8. Workflow Dashboard
- [ ] **Import Dashboard Template**
  - Visit: https://n8n.io/workflows/2269
  - Import to n8n

- [ ] **Configure Dashboard Metrics**
  - [ ] All active workflows
  - [ ] Execution success/failure rates
  - [ ] Average execution times
  - [ ] Failed executions (last 24h)
  - [ ] Resource usage per workflow

- [ ] **Set Up Daily Report**
  - Schedule: Daily at 8:00 AM
  - Recipients: Team email
  - Format: HTML email with charts

- [ ] **Integrate with Wallestars Dashboard**
  - Send metrics to `/api/webhooks/n8n/metrics`
  - Display in Wallestars UI

- [ ] **Test Dashboard**
  - Generate sample report
  - Verify all metrics accurate
  - Check email formatting

- [ ] **Activate Workflow**
  - Toggle workflow to active
  - Monitor daily reports

**Time Required**: 2-3 hours
**Priority**: MEDIUM

---

## Phase 3: Advanced Features (Week 3+) ⭐

### 9. Multi-Channel Alert System (Optional)
- [ ] **Choose Alert Channels**
  - [ ] Email (SMTP)
  - [ ] Slack
  - [ ] Discord
  - [ ] Telegram
  - [ ] SMS (Twilio)

- [ ] **Set Up Credentials**
  - Configure each channel in n8n
  - Test connectivity

- [ ] **Create Alert Workflow**
  - Receive alerts from other workflows
  - Route based on severity:
    - Info: Log only
    - Warning: Email
    - Critical: Email + Slack + SMS

- [ ] **Implement Alert Deduplication**
  - Prevent duplicate alerts within 5 minutes
  - Group similar alerts

- [ ] **Test Alert System**
  - Send test alerts at each severity
  - Verify routing works correctly

- [ ] **Activate Workflow**
  - Update all workflows to use alert system
  - Document alert procedures

**Time Required**: 3-4 hours
**Priority**: LOW

---

### 10. Release Monitoring (Optional)
- [ ] **Create Release Monitor Workflow**
  - Import template: https://n8n.io/workflows/736
  - Schedule: Daily

- [ ] **Configure Monitored Projects**
  - [ ] n8n/n8n
  - [ ] nodejs/node
  - [ ] Other critical dependencies

- [ ] **Set Notification Rules**
  - Major releases: Immediate notification
  - Minor releases: Daily digest
  - Patch releases: Weekly digest

- [ ] **Test Release Monitoring**
  - Verify RSS feed parsing
  - Check notification format

- [ ] **Activate Workflow**
  - Toggle workflow to active
  - Monitor first notifications

**Time Required**: 1-2 hours
**Priority**: LOW

---

## Integration Setup Checklist

### GitHub Integration
- [ ] Personal access token created
- [ ] Token scopes: `repo`, `workflow`, `read:org`
- [ ] Token added to n8n credentials
- [ ] Webhooks configured in repository
- [ ] Webhook secret configured (optional but recommended)
- [ ] Test webhook delivery

### n8n API
- [ ] n8n API enabled
- [ ] API key generated (if using authentication)
- [ ] API endpoint tested: `GET /api/v1/workflows`
- [ ] Credentials added to workflows

### Google Gemini API
- [ ] API key obtained from Google MakerSuite
- [ ] Free tier limits understood (60 req/min)
- [ ] API key added to n8n credentials
- [ ] Test API call successful

### AWS S3 (if using)
- [ ] S3 bucket created
- [ ] IAM user created for n8n
- [ ] Permissions: `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject`
- [ ] Access key and secret added to n8n
- [ ] Test file upload/download

### Email SMTP
- [ ] SMTP server configured
- [ ] Authentication credentials added
- [ ] Test email sent successfully
- [ ] SPF/DKIM configured (optional)

### Slack/Discord (if using)
- [ ] Webhook URL obtained
- [ ] Webhook added to n8n
- [ ] Test message sent successfully

---

## Verification Steps

### After Each Workflow Implementation
1. [ ] Workflow imported successfully
2. [ ] All credentials configured
3. [ ] Test execution completed without errors
4. [ ] Notifications received (if applicable)
5. [ ] Workflow activated
6. [ ] Documentation updated
7. [ ] Team notified

### Weekly Verification
1. [ ] Review failed workflow executions
2. [ ] Check backup integrity
3. [ ] Verify monitoring alerts are working
4. [ ] Review workflow performance metrics
5. [ ] Update workflow templates if needed

### Monthly Verification
1. [ ] Test backup restore process
2. [ ] Rotate credentials if needed
3. [ ] Review and optimize workflows
4. [ ] Update documentation
5. [ ] Security audit

---

## Troubleshooting Quick Reference

### Workflow Execution Failed
1. Check n8n logs: `/var/www/wallestars/logs/n8n-out.log`
2. Verify credentials are valid
3. Check API rate limits
4. Review error message in execution detail
5. Test individual nodes manually

### GitHub Webhook Not Triggering
1. Check webhook is active in GitHub settings
2. Verify webhook URL is correct and accessible
3. Check webhook delivery history in GitHub
4. Confirm webhook secret matches (if used)
5. Check n8n logs for incoming webhook requests

### Backup Failed
1. Check storage credentials are valid
2. Verify storage space available
3. Check database/file permissions
4. Review backup script output
5. Test backup script manually

### PM2 Restart Issues
1. Check application logs for errors
2. Verify PM2 is running: `pm2 status`
3. Increase restart delay in PM2 config
4. Check for port conflicts
5. Review health check logic

---

## Completion Status

### Phase 1: Critical Infrastructure
- [ ] Workflow Backup to GitHub - COMPLETE
- [ ] PR Linting with AI - COMPLETE
- [ ] Workflow Sync from GitHub - COMPLETE
- [ ] Database Backup - COMPLETE / N/A

**Phase 1 Complete**: ___% (0-100)

### Phase 2: Enhanced Monitoring
- [ ] Enhanced PM2 Monitoring - COMPLETE
- [ ] Deployment Automation - COMPLETE
- [ ] File Change Monitoring - COMPLETE
- [ ] Workflow Dashboard - COMPLETE

**Phase 2 Complete**: ___% (0-100)

### Phase 3: Advanced Features
- [ ] Multi-Channel Alerts - COMPLETE / SKIPPED
- [ ] Release Monitoring - COMPLETE / SKIPPED

**Phase 3 Complete**: ___% (0-100)

---

## Success Metrics

Track these metrics to measure implementation success:

- **Backup Success Rate**: ____% (Target: >99%)
- **PR Lint Coverage**: ____% of PRs (Target: 100%)
- **Deployment Success Rate**: ____% (Target: >95%)
- **Mean Time to Detect Issues**: ____ minutes (Target: <10)
- **Mean Time to Recover**: ____ minutes (Target: <30)
- **False Positive Alert Rate**: ____% (Target: <5%)

---

## Notes & Learnings

Use this section to document lessons learned during implementation:

```
Date: YYYY-MM-DD
Workflow: [Name]
Note: [What you learned]

Example:
Date: 2026-01-15
Workflow: PR Linting
Note: Gemini API works better with shorter code snippets. Split large PRs into multiple requests.
```

---

## Sign-Off

- [ ] **Phase 1 Reviewed and Approved**
  - Reviewer: __________
  - Date: __________

- [ ] **Phase 2 Reviewed and Approved**
  - Reviewer: __________
  - Date: __________

- [ ] **Phase 3 Reviewed and Approved**
  - Reviewer: __________
  - Date: __________

- [ ] **All Documentation Updated**
- [ ] **Team Training Completed**
- [ ] **Monitoring Dashboards Configured**
- [ ] **Backup/Recovery Procedures Tested**

---

**Implementation Start Date**: __________
**Expected Completion Date**: __________
**Actual Completion Date**: __________

**Total Implementation Time**: ____ hours
**Team Members Involved**: __________

---

## Quick Links

- [Full Research Report](./WORKFLOW_TEMPLATES_RESEARCH.md)
- [Implementation Guide](./IMPLEMENTATION_GUIDE.md)
- [n8n Dashboard](https://n8n.srv1201204.hstgr.cloud)
- [Wallestars Dashboard](https://srv1201204.hstgr.cloud)
- [GitHub Repository](https://github.com/Wallesters-org/Wallestars)
- [n8n Workflows Library](https://n8n.io/workflows/)
