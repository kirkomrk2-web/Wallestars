# GitHub Actions Required Secrets

Configure in: **GitHub → Settings → Secrets and variables → Actions**

| Secret | Required | Description |
|--------|----------|-------------|
| `N8N_WEBHOOK_URL` | ✅ | Base URL of n8n (e.g. `https://n8n.srv1201204.hstgr.cloud`) |
| `N8N_TOKEN` | ✅ | API token for n8n (Settings → API → Create key) |
| `N8N_AIRTOP_WEBHOOK_URL` | ✅ | Webhook URL for Airtop test session trigger in n8n |
| `SLACK_WEBHOOK_URL` | Optional | Slack incoming webhook for `#all-workmail-pro` |

## Fork PR Behavior

`trigger-airtop-session` job is **skipped for fork PRs** — GitHub restricts GITHUB_TOKEN write permissions for cross-repo PRs. Only same-repo PRs trigger Airtop sessions.
