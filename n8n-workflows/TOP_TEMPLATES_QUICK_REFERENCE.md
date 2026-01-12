# Top N8N Templates for Wallestars - Quick Reference

Essential n8n workflow templates ranked by value and implementation priority.

## 🔥 Must-Have Templates (Implement This Week)

### 1. Automated Daily Workflow Backup to GitHub ⭐⭐⭐⭐⭐
**Template**: https://n8n.io/workflows/4064
**Time**: 1-2 hours | **Cost**: Free
**What**: Daily automated backup of all n8n workflows to GitHub
**Why**: Disaster recovery, version control, workflow history
**Needs**: GitHub token (repo access)

```
Schedule: Daily 3:00 AM UTC
↓
Fetch all workflows via n8n API
↓
Commit to GitHub repository
↓
Send success notification
```

---

### 2. GitHub PR Linting with Google Gemini AI ⭐⭐⭐⭐⭐
**Template**: https://n8n.io/workflows/4073
**Time**: 2-3 hours | **Cost**: Free (Gemini tier)
**What**: AI-powered code review and quality checks on every PR
**Why**: Catch bugs early, enforce standards, improve code quality
**Needs**: Gemini API key (free 60 req/min), GitHub webhook

```
GitHub PR opened/updated
↓
Fetch PR diff and files
↓
Send to Gemini AI for analysis
↓
Post review comment on PR
↓
Notify Wallestars dashboard
```

**Checks For**:
- Security vulnerabilities
- Code quality issues
- Best practice violations
- Documentation completeness
- Potential bugs

---

### 3. Sync GitHub Workflows to n8n ⭐⭐⭐⭐⭐
**Template**: https://n8n.io/workflows/4500
**Time**: 2-3 hours | **Cost**: Free
**What**: Auto-import n8n workflows from GitHub when PRs merge
**Why**: Keep n8n in sync with repo, enable GitOps workflow
**Needs**: GitHub webhook, n8n API access

```
PR merged to main branch
↓
Detect changed .json files in n8n-workflows/
↓
Download workflow files
↓
Import/update workflows in n8n
↓
Activate if specified
```

---

### 4. Database Backup Automation ⭐⭐⭐⭐⭐
**Template**: https://n8n.io/workflows/6436 (adapt)
**Time**: 2-4 hours | **Cost**: Free (GitHub) or $2-5/mo (S3)
**What**: Automated database dumps with encryption and retention
**Why**: Data protection, disaster recovery, compliance
**Needs**: S3/GitHub, database access

```
Schedule: Daily 2:00 AM UTC
↓
Dump database (pg_dump/mysqldump)
↓
Compress with gzip
↓
Encrypt backup file
↓
Upload to S3/GitHub
↓
Delete old backups (>30 days)
↓
Send status notification
```

**Retention Policy**:
- Daily: 30 days
- Weekly: 3 months
- Monthly: 1 year

---

## 🚀 High Value Templates (Implement Next Week)

### 5. Enhanced PM2 Process Monitoring ⭐⭐⭐⭐
**Template**: Custom (enhance existing system-health-monitor.json)
**Time**: 3-4 hours | **Cost**: Free
**What**: Advanced PM2 monitoring with memory leak & CPU spike detection
**Why**: Proactive failure prevention, better diagnostics
**Needs**: PM2 CLI access, Wallestars API

**New Features**:
- Memory leak detection (trend analysis)
- CPU spike alerts (>80% for >5 min)
- Restart loop prevention (>5 in 10 min = alert)
- PM2 log parsing for errors
- Predictive failure detection

---

### 6. Deployment Automation Workflow ⭐⭐⭐⭐
**Template**: Custom (based on DevOps patterns)
**Time**: 4-5 hours | **Cost**: Free
**What**: Automated zero-downtime deployments with rollback
**Why**: Safer deployments, faster releases, automatic recovery
**Needs**: GitHub, PM2, health check endpoints

```
Deploy webhook triggered
↓
Pre-deployment checks (health, space, etc.)
↓
Git pull latest code
↓
npm install (if package.json changed)
↓
Build production assets
↓
PM2 reload (zero-downtime)
↓
Wait 30 seconds
↓
Post-deployment health checks
↓
✅ Success → Notify team
❌ Failure → Rollback to previous version
```

---

### 7. File Change Monitoring ⭐⭐⭐⭐
**Template**: https://n8n.io/workflows/967
**Time**: 2-3 hours | **Cost**: Free
**What**: Monitor critical files for unauthorized changes
**Why**: Security, audit trail, configuration drift detection
**Needs**: File system access, alert system

**Monitored Files**:
- `ecosystem.config.js` (PM2 config)
- `.env` files (secrets)
- `nginx.conf` (web server)
- `package.json` (dependencies)
- Security files

```
Schedule: Every 5 minutes
↓
Calculate file hashes (SHA256)
↓
Compare with stored hashes
↓
If changed → Generate file diff
↓
Send critical alert with diff
↓
Update stored hashes
```

---

### 8. Workflow Dashboard & Reports ⭐⭐⭐
**Template**: https://n8n.io/workflows/2269
**Time**: 2-3 hours | **Cost**: Free
**What**: Bird's-eye view of all workflows with daily reports
**Why**: Visibility, performance tracking, proactive management
**Needs**: n8n API, email/Slack

**Daily Report Includes**:
- All active workflows
- Execution success rate (last 24h)
- Failed executions with errors
- Average execution time per workflow
- Resource usage trends
- Recommendations for optimization

---

## 💡 Nice-to-Have Templates (Future Enhancements)

### 9. Multi-Website Monitoring with Phone Alerts ⭐⭐⭐
**Template**: https://n8n.io/workflows/4833
**Time**: 3-4 hours | **Cost**: ~$0.02/call (Twilio)
**What**: Monitor services with escalating alerts (Email → Slack → Call)
**Why**: Never miss critical outages
**Needs**: Twilio account, multiple notification channels

---

### 10. Release Monitoring & Update Notifications ⭐⭐
**Template**: https://n8n.io/workflows/736
**Time**: 1-2 hours | **Cost**: Free
**What**: Track new releases of n8n, Node.js, critical dependencies
**Why**: Stay current, security patches, new features
**Needs**: GitHub RSS feeds, notification channel

---

### 11. Google Analytics Reporting ⭐⭐
**Template**: https://n8n.io/workflows/2549
**Time**: 2-3 hours | **Cost**: Free
**What**: Automated weekly analytics reports with AI insights
**Why**: User behavior insights, performance metrics
**Needs**: Google Analytics, AI API (optional)

---

## 📊 Template Comparison Matrix

| Template | Priority | Time | Complexity | Cost | Dependencies |
|----------|----------|------|------------|------|--------------|
| **Workflow Backup** | 🔴 Critical | 1-2h | Low | Free | GitHub token |
| **PR Linting AI** | 🔴 Critical | 2-3h | Medium | Free | Gemini API, GitHub |
| **Workflow Sync** | 🔴 Critical | 2-3h | Medium | Free | n8n API, GitHub |
| **DB Backup** | 🔴 Critical | 2-4h | Medium | Free-$5 | S3/GitHub |
| **PM2 Monitoring** | 🟡 High | 3-4h | High | Free | PM2 CLI |
| **Deployment** | 🟡 High | 4-5h | High | Free | PM2, GitHub |
| **File Monitor** | 🟡 High | 2-3h | Low | Free | File system |
| **Dashboard** | 🟡 High | 2-3h | Medium | Free | n8n API |
| **Multi-Alerts** | 🟢 Medium | 3-4h | Medium | Varies | Twilio, Slack |
| **Release Monitor** | 🟢 Low | 1-2h | Low | Free | RSS feeds |
| **Analytics** | 🟢 Low | 2-3h | Medium | Free | Google Analytics |

---

## 🎯 Implementation Order

### Week 1: Foundation (8-12 hours)
```
Day 1-2: Workflow Backup to GitHub (1-2h)
Day 2-3: PR Linting with AI (2-3h)
Day 3-4: Workflow Sync from GitHub (2-3h)
Day 4-5: Database Backup (2-4h, if needed)
```

### Week 2: Enhancement (10-15 hours)
```
Day 6-7: Enhanced PM2 Monitoring (3-4h)
Day 8-9: Deployment Automation (4-5h)
Day 10: File Change Monitoring (2-3h)
Day 11: Workflow Dashboard (2-3h)
```

### Week 3+: Optional Features (5-10 hours)
```
As needed: Multi-channel alerts (3-4h)
As needed: Release monitoring (1-2h)
As needed: Analytics reports (2-3h)
```

**Total Time**: 23-37 hours over 3 weeks
**Total Cost**: $0-10/month (mostly free)

---

## 🔑 Required API Keys & Credentials

### Essential (Free)
- ✅ **GitHub Personal Access Token**
  - Get: https://github.com/settings/tokens
  - Scopes: `repo`, `workflow`, `read:org`
  - Used by: Backup, PR linting, workflow sync

- ✅ **n8n API Access**
  - Get: n8n Settings > API
  - Used by: Backup, workflow sync, dashboard

- ✅ **Google Gemini API Key**
  - Get: https://makersuite.google.com/app/apikey
  - Limit: 60 requests/min (free tier)
  - Used by: PR linting, code analysis

### Optional (Free Tier)
- 🔹 **AWS S3 Credentials** (if using S3)
  - Free tier: 5GB storage, 20k GET, 2k PUT
  - Used by: Database backups

- 🔹 **SendGrid API** (if using email)
  - Free tier: 100 emails/day
  - Used by: Notifications, reports

### Optional (Paid)
- 💰 **Twilio** (for phone alerts)
  - Cost: ~$0.01/SMS, ~$0.02/call
  - Used by: Critical alerts

---

## 💰 Cost Breakdown

### Current Setup
- n8n: **$0** (self-hosted)
- GitHub: **$0** (public repo)
- All workflows: **$0**

**Total: $0/month**

### With Recommended Templates (Free Tier)
- Gemini API: **$0** (60 req/min free)
- AWS S3: **$0** (5GB free tier)
- SendGrid: **$0** (100 emails/day)
- All workflows: **$0**

**Total: $0/month**

### With Premium Features
- S3 storage (>5GB): **$1-3/month**
- SendGrid Pro: **$0-5/month** (if >100 emails/day)
- Twilio alerts: **$2-5/month** (occasional use)

**Total: $3-13/month** (only if needed)

---

## ⚡ Quick Start Commands

### Test n8n API Access
```bash
curl -X GET https://n8n.srv1201204.hstgr.cloud/api/v1/workflows
```

### Check PM2 Status
```bash
pm2 status
pm2 logs --lines 50
```

### Test GitHub Webhook
```bash
curl -X POST https://n8n.srv1201204.hstgr.cloud/webhook/test \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

### View n8n Logs
```bash
tail -f /var/www/wallestars/logs/n8n-out.log
tail -f /var/www/wallestars/logs/n8n-err.log
```

### Backup Database Manually (PostgreSQL)
```bash
pg_dump wallestars_db | gzip > backup_$(date +%Y%m%d).sql.gz
```

### Import n8n Workflow
```bash
# Via UI: Workflows > Import from File > Select JSON
# Or via API:
curl -X POST https://n8n.srv1201204.hstgr.cloud/api/v1/workflows \
  -H "Content-Type: application/json" \
  -d @workflow.json
```

---

## 🛠️ Troubleshooting Quick Fixes

### Workflow Not Triggering
```bash
# Check workflow is active
# Check cron schedule is correct
# Check webhook URL is accessible
# Review n8n logs for errors
```

### GitHub Webhook Failed
```bash
# Verify webhook URL: Settings > Webhooks
# Check webhook delivery history
# Ensure webhook secret matches
# Test with "Redeliver" button
```

### PM2 Restart Issues
```bash
pm2 restart wallestars
pm2 reload wallestars  # Zero-downtime
pm2 logs wallestars --err  # Check errors
```

### Database Backup Failed
```bash
# Check database is running
# Verify credentials
# Check disk space: df -h
# Test backup command manually
```

---

## 📱 Notification Channels

### Already Configured
- ✅ Wallestars Dashboard (WebSocket)
- ✅ n8n Logs

### Easy to Add (Free)
- 📧 Email (SMTP)
- 💬 Slack (Webhook)
- 🤖 Discord (Webhook)
- 📱 Telegram (Bot API)

### Premium Options
- 📞 Phone Calls (Twilio)
- 📨 SMS (Twilio)
- 📟 PagerDuty

---

## 🎓 Learning Resources

### Official Documentation
- [n8n Workflows Library](https://n8n.io/workflows/)
- [n8n Documentation](https://docs.n8n.io/)
- [GitHub API Docs](https://docs.github.com/en/rest)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)

### Video Tutorials
- [n8n YouTube Channel](https://www.youtube.com/c/n8n-io)
- [How to Build GitHub PR Agent (15 min)](https://www.educative.io/blog/how-to-build-a-github-pr-agent-with-n8n-in-15-minutes)

### Community
- [n8n Community Forums](https://community.n8n.io/)
- [n8n Discord](https://discord.gg/n8n)

---

## 📋 Pre-Implementation Checklist

Before implementing any workflow:

- [ ] Read full template documentation
- [ ] Understand what the workflow does
- [ ] Identify required credentials/APIs
- [ ] Check API rate limits
- [ ] Plan testing approach
- [ ] Document expected behavior
- [ ] Set up monitoring/alerts
- [ ] Prepare rollback plan

---

## ✅ Success Criteria

You'll know implementation is successful when:

1. **Backups Running Daily**
   - ✅ Workflows backed up to GitHub
   - ✅ Database backed up (if applicable)
   - ✅ Restore tested successfully

2. **PR Quality Improved**
   - ✅ AI review on every PR
   - ✅ Catching bugs before merge
   - ✅ Code quality trending up

3. **Automation Working**
   - ✅ Workflows sync from GitHub
   - ✅ Deployments automated
   - ✅ Zero manual intervention

4. **Monitoring Enhanced**
   - ✅ No surprises (alerts before failures)
   - ✅ Clear visibility into system health
   - ✅ Fast response to issues

---

## 📞 Need Help?

If you get stuck:

1. **Check n8n logs** first
2. **Search n8n community forums**
3. **Review template documentation**
4. **Test individual nodes** in isolation
5. **Ask in n8n Discord**

---

**Quick Reference Version**: 1.0
**Last Updated**: January 12, 2026
**Maintained By**: Wallestars Team

---

## 🔗 Essential Links

- **n8n Dashboard**: https://n8n.srv1201204.hstgr.cloud
- **Wallestars App**: https://srv1201204.hstgr.cloud
- **GitHub Repo**: https://github.com/Wallesters-org/Wallestars
- **Full Research**: [WORKFLOW_TEMPLATES_RESEARCH.md](./WORKFLOW_TEMPLATES_RESEARCH.md)
- **Implementation Checklist**: [TEMPLATE_IMPLEMENTATION_CHECKLIST.md](./TEMPLATE_IMPLEMENTATION_CHECKLIST.md)
