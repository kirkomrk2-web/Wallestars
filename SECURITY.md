# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of Wallestars Control Center seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to: **security@wallestars.com** (or your preferred contact)

Please include the following information in your report:

- Type of issue (e.g., buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit the issue

### What to Expect

- We will acknowledge your email within 48 hours
- We will provide a detailed response within 7 days
- We will work with you to understand and resolve the issue
- We will keep you informed of our progress

## Security Best Practices

### For Developers

1. **Never commit secrets**: API keys, passwords, and credentials must never be committed to the repository
2. **Use environment variables**: Store all sensitive configuration in `.env` files (excluded from git)
3. **Validate inputs**: Always validate and sanitize user inputs
4. **Keep dependencies updated**: Regularly run `npm audit` and update vulnerable packages
5. **Use HTTPS**: Always use HTTPS in production

### API Key Management

- Store API keys in environment variables only
- Never hardcode API keys in source code
- Use GitHub Secrets for CI/CD workflows
- Rotate keys regularly

### VPS Security

- Use SSH key authentication instead of passwords
- Disable root login via password
- Keep system packages updated
- Configure firewall (ufw/iptables)
- Use fail2ban for brute-force protection

## Security Features

### Current Implementation

- ✅ Environment variable configuration
- ✅ CORS protection (configurable)
- ✅ Whitelisted shell commands for Computer Use
- ✅ Session-based authentication for n8n

### Planned Improvements

- [ ] Rate limiting for API endpoints
- [ ] CSRF protection
- [ ] Content Security Policy headers
- [ ] Security audit logging

## Disclosure Policy

When a security vulnerability is reported:

1. We confirm the vulnerability
2. We determine the severity and impact
3. We develop and test a fix
4. We release the fix
5. We publicly disclose the vulnerability (after fix is available)

## Contact

For security concerns, please contact:
- Email: security@wallestars.com
- GitHub: Create a private security advisory

Thank you for helping keep Wallestars Control Center secure!
