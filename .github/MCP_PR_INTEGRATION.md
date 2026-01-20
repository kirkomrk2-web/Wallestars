# MCP Integration for PR Automation

## Overview

This document describes how the Model Context Protocol (MCP) is integrated with GitHub Actions workflows to enable AI-powered PR automation and repository management.

## MCP Configuration

### Current MCP Server Setup

The repository includes an MCP server (`server/index.js`) that exposes the following capabilities:

1. **Claude AI Integration**: Direct access to Claude Sonnet 4.5 API
2. **Computer Use API**: Linux desktop automation via xdotool
3. **Android Control**: Device automation via ADB
4. **Screenshot Capture**: Visual analysis capabilities
5. **System Information**: Runtime environment monitoring

### MCP Tools for PR Automation

#### Tool 1: `analyze_pr_changes`
**Purpose**: Analyze code changes in a PR using Claude AI
**Capabilities**:
- Diff analysis
- Code quality assessment
- Security vulnerability detection
- Best practice recommendations

#### Tool 2: `run_automated_tests`
**Purpose**: Execute automated test suites
**Capabilities**:
- Unit test execution
- Integration test execution
- E2E test execution
- Test result aggregation

#### Tool 3: `merge_branch_safely`
**Purpose**: Safely merge branches with conflict detection
**Capabilities**:
- Conflict detection
- Automated resolution (where possible)
- Rollback mechanism
- Notification system

#### Tool 4: `generate_documentation`
**Purpose**: Auto-generate documentation from code
**Capabilities**:
- Code comment extraction
- API documentation generation
- README updates
- Changelog generation

## Workflow Integration

### GitHub Actions ↔ MCP Communication

```yaml
# Example workflow step using MCP
- name: Analyze PR with MCP
  run: |
    node server/index.js mcp-call analyze_pr_changes \
      --pr-number ${{ github.event.pull_request.number }} \
      --repository ${{ github.repository }}
```

### MCP Server Endpoints

1. **POST /mcp/analyze**
   - Analyzes PR changes using Claude AI
   - Returns structured feedback

2. **POST /mcp/test**
   - Runs automated test suite
   - Returns test results

3. **POST /mcp/merge**
   - Performs safe branch merge
   - Returns merge status

4. **POST /mcp/document**
   - Generates documentation
   - Returns updated docs

## Configuration Files

### `.mcp.json`
```json
{
  "mcpServers": {
    "wallestars-control": {
      "command": "node",
      "args": ["server/index.js"],
      "env": {
        "ANTHROPIC_API_KEY": "${ANTHROPIC_API_KEY}",
        "PORT": "3000",
        "NODE_ENV": "production",
        "ENABLE_COMPUTER_USE": "true",
        "ENABLE_ANDROID": "false"
      }
    }
  }
}
```

### Environment Variables Required

```bash
# Required for MCP functionality
ANTHROPIC_API_KEY=sk-ant-xxx
GITHUB_TOKEN=ghp_xxx
N8N_WEBHOOK_URL=https://n8n.srv1201204.hstgr.cloud

# Optional for enhanced features
ENABLE_COMPUTER_USE=true
ENABLE_ANDROID=false
SCREENSHOT_INTERVAL=2000
```

## Integration with N8N

### Workflow Trigger Points

1. **PR Created**: Trigger initial analysis
2. **PR Updated**: Re-run checks
3. **PR Commented**: Process feedback
4. **PR Merged**: Update documentation

### N8N Workflow Configuration

```javascript
{
  "name": "MCP-PR-Integration",
  "nodes": [
    {
      "name": "GitHub Trigger",
      "type": "github",
      "webhookEvents": ["pull_request"]
    },
    {
      "name": "Call MCP Server",
      "type": "http",
      "method": "POST",
      "url": "http://localhost:3000/mcp/analyze"
    },
    {
      "name": "Process Results",
      "type": "function",
      "code": "// Process MCP response"
    },
    {
      "name": "Update PR",
      "type": "github",
      "operation": "create_comment"
    }
  ]
}
```

## Usage Examples

### Example 1: Automated PR Review

```bash
# Trigger MCP analysis for PR #123
curl -X POST http://localhost:3000/mcp/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "pr_number": 123,
    "repository": "kirkomrk2-web/Wallestars",
    "analysis_type": "full"
  }'
```

### Example 2: Safe Branch Merge

```bash
# Merge branch with MCP safety checks
curl -X POST http://localhost:3000/mcp/merge \
  -H "Content-Type: application/json" \
  -d '{
    "source_branch": "feature/new-feature",
    "target_branch": "main",
    "strategy": "safe-merge"
  }'
```

### Example 3: Generate Documentation

```bash
# Generate docs for changed files
curl -X POST http://localhost:3000/mcp/document \
  -H "Content-Type: application/json" \
  -d '{
    "pr_number": 123,
    "format": "markdown"
  }'
```

## Advanced Features

### 1. AI-Powered Code Review

The MCP server uses Claude AI to provide intelligent code reviews:

- **Security Analysis**: Detects potential vulnerabilities
- **Performance Analysis**: Identifies performance bottlenecks
- **Best Practices**: Suggests improvements
- **Documentation**: Flags missing or outdated docs

### 2. Automated Test Generation

Generate test cases automatically:

```javascript
// MCP will analyze code and suggest tests
{
  "file": "src/components/Button.jsx",
  "generate_tests": true,
  "test_types": ["unit", "integration"]
}
```

### 3. Conflict Resolution

Intelligent merge conflict resolution:

- Analyzes conflicting changes
- Suggests resolution strategies
- Applies safe automatic fixes
- Escalates complex conflicts

### 4. Documentation Sync

Keep documentation in sync with code:

- Monitors code changes
- Updates relevant documentation
- Generates changelog entries
- Creates API documentation

## Security Considerations

### API Key Management

- Store keys in GitHub Secrets
- Never commit keys to repository
- Rotate keys regularly
- Use environment-specific keys

### Access Control

- Limit MCP server access
- Implement rate limiting
- Log all operations
- Monitor for abuse

### Data Privacy

- Don't send sensitive data to external APIs
- Sanitize inputs
- Encrypt communications
- Audit data flows

## Monitoring & Debugging

### Health Checks

```bash
# Check MCP server status
curl http://localhost:3000/health

# Expected response:
{
  "status": "healthy",
  "mcp_enabled": true,
  "claude_api": "connected",
  "version": "1.0.0"
}
```

### Logging

MCP operations are logged to:
- GitHub Actions logs
- N8N execution logs
- MCP server logs (`server/logs/`)

### Debugging

Enable debug mode:
```bash
DEBUG=mcp:* node server/index.js
```

## Future Enhancements

### Planned Features

1. **Multi-Repository Support**: Manage PRs across multiple repos
2. **Smart Scheduling**: Optimize workflow execution timing
3. **Learning System**: Improve suggestions based on feedback
4. **Visual Diff Analysis**: Use screenshot capabilities for UI changes
5. **Mobile Testing**: Integrate Android control for app testing

### Roadmap

- **Q1 2026**: Basic MCP integration with PR automation
- **Q2 2026**: Advanced AI features and multi-repo support
- **Q3 2026**: Mobile testing integration
- **Q4 2026**: Full automation with learning system

## Support & Resources

### Documentation Links

- [MCP Official Docs](https://modelcontextprotocol.io/)
- [Claude API Docs](https://docs.anthropic.com/)
- [GitHub Actions Docs](https://docs.github.com/actions)
- [N8N Docs](https://docs.n8n.io/)

### Internal Documentation

- `MCP_SETUP.md` - MCP server setup guide
- `MCP_INTEGRATION_SUMMARY.md` - Integration overview
- `ARCHITECTURE.md` - System architecture
- `.github/AUTOMATION_SYSTEM.md` - Automation details

### Getting Help

1. Check documentation first
2. Review GitHub Issues
3. Check N8N execution logs
4. Contact repository maintainers

## Conclusion

The MCP integration enables powerful AI-driven automation for PR management and repository consolidation. By combining GitHub Actions, N8N workflows, and Claude AI, we can:

- Automate routine tasks
- Improve code quality
- Reduce manual effort
- Accelerate development

This integration is a key part of the repository consolidation strategy and will help manage the transition to a streamlined 2-3 repository structure.
