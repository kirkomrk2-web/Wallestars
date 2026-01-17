---
name: wallestars-cicd
description: CI/CD pipeline management for Wallestars using GitHub Actions. Use when setting up automated testing, deployment workflows, integration tests, or managing continuous delivery pipelines for VPS deployment and service validation.
---

# Wallestars CI/CD Management

Comprehensive GitHub Actions workflows for continuous integration, testing, and deployment automation.

## Workflows

### 1. deploy-to-vps.yml

Automated deployment pipeline to Hostinger VPS.

**Triggers:**
- Push to `main` branch
- Push to `production` branch
- Manual workflow dispatch

**Steps:**
1. Checkout code
2. Setup SSH keys
3. Connect to VPS
4. Pull latest code
5. Build Docker containers
6. Update running services
7. Run health checks
8. Cleanup old images
9. Send deployment notification

**Configuration:**

```yaml
name: Deploy to VPS

on:
  push:
    branches: [main, production]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to VPS
        env:
          VPS_SSH_KEY: ${{ secrets.VPS_SSH_KEY }}
          VPS_IP: 72.61.154.188
          VPS_USER: root
```

**Required Secrets:**
- `VPS_SSH_KEY` - SSH private key for VPS access
- `ANTHROPIC_API_KEY` - For AI agent notifications (optional)

### 2. test-integrations.yml

Integration testing for all Wallestars components.

**Triggers:**
- Pull requests
- Push to feature branches
- Scheduled daily at 2 AM UTC

**Tests:**
1. **33mail Integration**
   - Create test alias
   - List aliases
   - Verify storage
   - Cleanup test data

2. **VPS Connectivity**
   - SSH connection test
   - Service availability
   - Health endpoint checks

3. **Multi-Agent System**
   - API key validation
   - Agent routing logic
   - Memory operations

4. **Configuration Validation**
   - YAML syntax
   - Environment variables
   - Dependencies check

**Output:**
- Test report summary
- Coverage statistics
- PR comment with results

## Setting Up GitHub Secrets

### Required Secrets

```bash
# VPS SSH Key
gh secret set VPS_SSH_KEY < ~/.ssh/id_rsa

# Anthropic API Key
gh secret set ANTHROPIC_API_KEY
# Enter key when prompted

# 33mail Configuration (if needed)
gh secret set EMAIL_USERNAME
gh secret set EMAIL_DOMAIN
```

### Verify Secrets

```bash
gh secret list
```

Should show:
- VPS_SSH_KEY
- ANTHROPIC_API_KEY
- EMAIL_USERNAME (optional)
- EMAIL_DOMAIN (optional)

## Local Testing

### Test Deployment Locally

```bash
# Simulate deployment
cd .github/workflows
act -j deploy -s VPS_SSH_KEY="$(cat ~/.ssh/id_rsa)"
```

### Test Integration Suite

```bash
# Run all tests
pytest tests/integration/

# Run specific test
pytest tests/integration/test_33mail.py -v

# Run with coverage
pytest --cov=integrations tests/integration/
```

## Workflow Best Practices

### 1. Branch Protection

Configure branch protection for `main` and `production`:
- Require PR reviews
- Require status checks to pass
- Require branches to be up to date

```bash
# Via GitHub CLI
gh api repos/Wallesters-org/Wallestars/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["test-integrations"]}' \
  --field required_pull_request_reviews='{"required_approving_review_count":1}'
```

### 2. Environment-Specific Deployments

```yaml
# In deploy-to-vps.yml
jobs:
  deploy:
    environment:
      name: production
      url: https://n8n.srv1201204.hstgr.cloud
```

### 3. Rollback Strategy

```bash
# Manual rollback
gh workflow run deploy-to-vps.yml \
  --ref <previous-commit-sha>
```

### 4. Deployment Notifications

Add Slack/Discord notifications:

```yaml
- name: Notify Deployment
  if: success()
  run: |
    curl -X POST ${{ secrets.WEBHOOK_URL }} \
      -H 'Content-Type: application/json' \
      -d '{"text":"Deployment successful to ${{ github.ref }}"}'
```

## Monitoring Workflows

### View Workflow Runs

```bash
gh run list --workflow=deploy-to-vps.yml

gh run list --workflow=test-integrations.yml --limit 10
```

### View Specific Run

```bash
gh run view <run-id>

gh run view <run-id> --log
```

### Re-run Failed Workflow

```bash
gh run rerun <run-id>

gh run rerun <run-id> --failed
```

## Troubleshooting

### Deployment Failures

**SSH Connection Issues:**
```bash
# Verify secret is set
gh secret list | grep VPS_SSH_KEY

# Test SSH connection locally
ssh -i ~/.ssh/id_rsa root@72.61.154.188
```

**Docker Build Failures:**
```bash
# Check logs
gh run view --log | grep "docker build"

# Test locally
docker-compose build --no-cache
```

### Integration Test Failures

**33mail Tests:**
```bash
# Check test output
gh run view --log | grep "test_33mail"

# Run locally
python -m pytest tests/integration/test_33mail.py -v
```

**VPS Health Check Fails:**
```bash
# Manual health check
vps-health

# Check specific service
vps status n8n
```

### Performance Issues

**Slow Builds:**
```yaml
# Add caching
- uses: actions/cache@v3
  with:
    path: ~/.cache/pip
    key: ${{ runner.os }}-pip-${{ hashFiles('requirements.txt') }}
```

**Timeout Issues:**
```yaml
# Increase timeout
jobs:
  deploy:
    timeout-minutes: 30
```

## Advanced Workflows

### Matrix Testing

```yaml
strategy:
  matrix:
    python-version: [3.9, 3.10, 3.11]
    os: [ubuntu-latest, macos-latest]
```

### Conditional Deployments

```yaml
- name: Deploy to Production
  if: github.ref == 'refs/heads/production'
  run: |
    vps deploy production

- name: Deploy to Staging
  if: github.ref == 'refs/heads/main'
  run: |
    vps deploy staging
```

### Scheduled Maintenance

```yaml
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM

jobs:
  maintenance:
    runs-on: ubuntu-latest
    steps:
      - name: Database Backup
        run: vps backup
      
      - name: Cleanup Old Images
        run: vps cleanup
      
      - name: Update Dependencies
        run: vps update-deps
```

## Workflow Templates

### Quick Deployment Workflow

```yaml
name: Quick Deploy
on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy'
        required: true
        type: choice
        options:
          - staging
          - production

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy
        run: vps deploy ${{ inputs.environment }}
```

### Integration Test Template

```yaml
name: Integration Tests
on: [pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: pip install -r requirements.txt
      - run: pytest tests/integration/ -v --cov
      - name: Comment PR
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '✅ All integration tests passed!'
            })
```
