---
name: wallestars-email-management
description: 33mail disposable email alias management for Wallestars. Use when creating temporary email addresses, managing email aliases, protecting privacy, or organizing email subscriptions for different services and purposes.
---

# Wallestars Email Management

Comprehensive 33mail disposable email alias management system for privacy-focused email handling.

## Overview

33mail service provides disposable email aliases using pattern `krasavetsa1.<purpose>@33mail.com`. All aliases forward to primary account while maintaining privacy and organization.

## Core Commands

### Create Alias

```bash
33mail create <purpose> [description]
email-create <purpose>              # Quick alias
```

Examples:
```bash
33mail create github "GitHub account registration"
33mail create netflix "Netflix subscription"
33mail create testing-platform "Platform testing account"
```

Created aliases follow pattern: `krasavetsa1.<purpose>@33mail.com`

### List Aliases

```bash
33mail list              # Active aliases only
33mail list --all        # All aliases (active + inactive)
email-list              # Quick alias
```

Output includes:
- Email address
- Purpose/description
- Creation date
- Status (active/inactive)
- Message count (if available)

### Get Specific Alias

```bash
33mail get <purpose>
email-get <purpose>
```

Retrieves specific alias and copies to clipboard automatically.

### Search Aliases

```bash
33mail search <query>
```

Search by:
- Purpose name
- Description text
- Email pattern

Examples:
```bash
33mail search "social"    # Find all social media aliases
33mail search "test"      # Find test-related aliases
```

### Statistics

```bash
33mail stats
```

Shows:
- Total aliases created
- Active vs inactive count
- Most used aliases
- Recent creations

### Export Data

```bash
33mail export --format json
33mail export --format csv
```

Export all aliases to:
- JSON format (structured data)
- CSV format (spreadsheet compatible)

## Configuration

### Storage Location

```bash
~/.config/33mail/aliases.json
```

Local storage structure:
```json
{
  "aliases": [
    {
      "purpose": "github",
      "email": "krasavetsa1.github@33mail.com",
      "description": "GitHub account",
      "created_at": "2026-01-02T10:30:00Z",
      "status": "active"
    }
  ]
}
```

### Clipboard Integration

All `get` and `create` commands automatically copy email to clipboard for easy pasting.

## Use Cases

### Service Registration

```bash
# Different alias for each service
33mail create linkedin "LinkedIn profile"
33mail create twitter "Twitter account"
33mail create facebook "Facebook account"
```

### Testing & Development

```bash
# Test accounts with descriptive names
33mail create ci-testing "CI/CD pipeline tests"
33mail create staging "Staging environment"
33mail create qa-automation "QA automation tests"
```

### Privacy Protection

```bash
# Temporary aliases for untrusted sites
33mail create temp-promo "Promotional offer"
33mail create one-time-purchase "One-time purchase"
```

### Organization

```bash
# Group by category
33mail create work-newsletter "Work-related newsletters"
33mail create personal-shopping "Personal shopping accounts"
33mail create subscriptions-tech "Tech subscriptions"
```

## Workflow Examples

### Register New Service

```bash
# 1. Create alias
33mail create new-service "Description"

# 2. Email is automatically copied to clipboard

# 3. Paste in registration form

# 4. Verify creation
33mail list
```

### Find Forgotten Alias

```bash
# Search by service name
33mail search "netflix"

# Or list all and grep
33mail list | grep -i "streaming"
```

### Audit Email Usage

```bash
# View statistics
33mail stats

# Export for analysis
33mail export --format csv > ~/aliases-audit.csv
```

### Cleanup Old Aliases

```bash
# List all aliases
33mail list --all

# Identify inactive ones
# (Manual deactivation via 33mail web interface)
```

## Best Practices

1. **Use descriptive purposes**: `github-work` instead of `gh1`
2. **Add meaningful descriptions**: Future reference clarity
3. **Regular audits**: Monthly review with `33mail stats`
4. **Export backups**: Quarterly `33mail export --format json > backup.json`
5. **Consistent naming**: Use hyphens, lowercase

## Integration with Other Tools

### With Password Manager

```bash
# Create alias and store in KeePass
EMAIL=$(33mail create service "Service name" | grep "Created:" | cut -d' ' -f2)
keepass-get service  # Store with credentials
```

### With CI/CD

```bash
# Automated testing accounts
33mail create "ci-${BUILD_NUMBER}" "CI run ${BUILD_NUMBER}"
```

### With Scripts

```bash
# Programmatic access
ALIAS=$(33mail get github)
echo "Using email: $ALIAS"
```
