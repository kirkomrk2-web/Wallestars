# 🚀 Wallestars Development Container

Пълно интегрирана development среда с AI assistants, security tools и cloud infrastructure management.

## 🎯 Features

### 🤖 AI & Automation
- **Cline (Claude Dev)**: 1M token context model for complex tasks
- **GitHub Copilot**: AI-powered code completion
- **Continue.dev**: Multi-model AI assistant
- **n8n**: Workflow automation engine
- **Eva Core**: Custom AI algorithm for social media

### 🔐 Security & Secrets
- **KeePassXC Integration**: Secure credential management
- **Environment Variables**: Automatic .env setup
- **SSH Keys**: Read-only mount from host
- **Secrets Manager**: Helper scripts for secret access
- **No Plain-text Passwords**: Best practices enforced

### ☁️ Cloud & Infrastructure
- **Azure CLI**: Manage 15 Ubuntu Pro VMs (5 free + 10 bonus)
- **AWS CLI**: Multi-cloud support
- **Terraform**: Infrastructure as code
- **Kubernetes**: kubectl, helm, minikube
- **Docker**: Full docker-in-docker support

### 🗄️ Database & Backend
- **Supabase**: Integrated CLI and VS Code extension
- **PostgreSQL**: Client tools
- **Redis**: Redis-tools for caching
- **SQLTools**: Database management in VS Code

### 🛠️ Development Tools
- **Node.js 22**: Latest LTS
- **Python 3.11**: AI/ML libraries
- **TypeScript**: Full TS support
- **Jest**: Testing framework
- **ESLint & Prettier**: Code quality

## 📋 Prerequisites

1. **GitHub Account** with Copilot Enterprise access
2. **API Keys**:
   - Claude AI (Anthropic)
   - OpenAI (GPT-4)
   - Supabase
   - GitHub Token
3. **Optional**:
   - KeePassXC database on Tails OS persistent storage
   - Azure subscription (for Ubuntu Pro VMs)

## 🚀 Quick Start

### 1. Open in Dev Container

```bash
# In VS Code
Cmd/Ctrl + Shift + P → "Dev Containers: Reopen in Container"
```

### 2. Configure Secrets

**Option A: Manual .env**
```bash
cp .env.example .env
# Edit .env with your API keys
```

**Option B: KeePassXC Integration**
```bash
# Set KeePassXC paths
export KEEPASS_DB_PATH=/path/to/your/keepass.kdbx
export KEEPASS_KEY_FILE=/path/to/your/keepass.key

# Get secrets
export CLAUDE_API_KEY=$(keepass-get "Claude API Key")
export GITHUB_TOKEN=$(keepass-get "GitHub Token")
```

### 3. Start Services

```bash
# Start Eva Core
eva-start

# Start n8n (in another terminal)
n8n-start

# Start Supabase locally (optional)
supabase-local
```

## 🔧 Helper Scripts

All scripts are in `~/.local/bin/` and added to PATH:

### Eva & Services
```bash
eva-start        # Start Eva Core
n8n-start        # Start n8n workflow engine
supabase-local   # Start Supabase local instance
```

### Secret Management
```bash
keepass-get <entry>  # Extract secret from KeePassXC
```

### Azure VM Management
```bash
azure-vm-list                        # List all VMs
azure-vm-start <name> <group>        # Start a VM
azure-vm-stop <name> <group>         # Stop a VM
```

## 🌐 Port Forwarding

Automatically forwarded ports:

| Port  | Service           | Auto-Open   |
|-------|-------------------|-------------|
| 3000  | Frontend          | Notify      |
| 5000  | Backend API       | Notify      |
| 5678  | n8n               | Browser     |
| 8000  | Python Dev        | Silent      |
| 8080  | Dev Server        | Silent      |
| 9229  | Node.js Debugger  | Silent      |
| 54321 | Supabase Studio   | Browser     |

## 🤖 Cline (Claude Dev) Setup

### Recommended Settings

1. **Model**: `claude-sonnet-4-20250514` (1M context)
2. **Max Tokens**: 8192
3. **Temperature**: 0.7

### Permissions to Grant

- ✅ Read files in workspace
- ✅ Write files (with review)
- ✅ Execute terminal commands (with approval)
- ✅ Use browser for testing
- ✅ Access environment variables (secure)

### Example Tasks for Cline

```
"Analyze the entire Eva Core codebase and suggest optimizations"
"Create a new n8n workflow for Instagram automation"
"Review all security vulnerabilities in the project"
"Generate comprehensive tests for all modules"
```

## 📦 VS Code Extensions

### Pre-installed Extensions

**AI & Productivity**
- Claude Dev (Cline)
- GitHub Copilot + Labs
- Continue.dev

**Development**
- ESLint, Prettier
- GitLens
- Jest Runner
- SonarLint

**Database**
- SQLTools + PostgreSQL
- Supabase Extension

**Cloud & DevOps**
- Docker
- Kubernetes
- Terraform
- Azure Functions

**Utilities**
- Thunder Client (API testing)
- Todo Tree
- Error Lens
- Path Intellisense

## 🔐 Security Best Practices

### 1. KeePassXC Integration

**Setup on Tails OS:**
```bash
# On Tails OS with persistent storage
# 1. Create database in persistent storage
# 2. Use password generator for master password
# 3. Add key file for extra security
# 4. Store passphrase in secure location (not digital)
```

**Access from Dev Container:**
```bash
# Mount Tails persistent storage (if accessible)
export KEEPASS_DB_PATH=/mnt/persistent/keepass.kdbx
export KEEPASS_KEY_FILE=/mnt/persistent/keepass.key

# Use helper script
keepass-get "Entry Name"
```

### 2. Environment Variables

```bash
# Never commit .env
# Always use .env.example as template
# Rotate keys regularly
```

### 3. Git Security

```bash
# SSH keys are mounted read-only
# No force push allowed
# Commits signed (configure GPG if needed)
```

### 4. Secrets in Code

```bash
# Use environment variables
process.env.CLAUDE_API_KEY

# Never hardcode
# const apiKey = "sk-ant-..." ❌
```

## ☁️ Azure Ubuntu Pro VMs

### Available Resources
- **5 free VMs** (Ubuntu Pro included)
- **10 bonus VMs** (additional allocation)
- **Total: 15 VMs**

### Management

```bash
# Login to Azure
az login

# List all VMs
azure-vm-list

# Start development VM
azure-vm-start dev-vm-1 wallestars-rg

# Stop when done
azure-vm-stop dev-vm-1 wallestars-rg

# SSH into VM
az ssh vm --name dev-vm-1 --resource-group wallestars-rg
```

### Use Cases
1. **n8n Production**: Deploy n8n on VM
2. **Eva Testing**: Test Eva on separate VM
3. **Database**: PostgreSQL/Supabase on VM
4. **Staging**: Full stack staging environment
5. **CI/CD Runners**: Self-hosted GitHub Actions

## 📚 Documentation Structure

```
~/workspace/
├── DEVCONTAINER-GUIDE.md    # This file
├── secrets/                  # Gitignored secrets directory
├── backups/                  # Backup storage
├── logs/                     # Application logs
└── temp/                     # Temporary files

~/.local/bin/
├── eva-start                 # Eva Core launcher
├── n8n-start                 # n8n launcher
├── supabase-local            # Supabase launcher
├── keepass-get               # KeePassXC integration
└── azure-vm-*                # Azure VM management
```

## 🔗 Important Links

### Project Documentation
- [Main README](/README.md)
- [Quick Access](/docs/QUICK-ACCESS.md)
- [Eva Integration](/docs/EVA-DJ-INTEGRATION.md)
- [File Structure](/docs/FILE-STRUCTURE.md)

### External Services
- [Claude AI Console](https://console.anthropic.com/)
- [Supabase Dashboard](https://app.supabase.com/)
- [GitHub Copilot Settings](https://github.com/settings/copilot)
- [Azure Portal](https://portal.azure.com/)

### Tools Documentation
- [n8n Docs](https://docs.n8n.io/)
- [KeePassXC Guide](https://keepassxc.org/docs/)
- [Azure CLI Reference](https://docs.microsoft.com/en-us/cli/azure/)

## 🐛 Troubleshooting

### Container Won't Start
```bash
# Rebuild container
Cmd/Ctrl + Shift + P → "Dev Containers: Rebuild Container"
```

### n8n Port Already in Use
```bash
# Check what's using port 5678
sudo lsof -i :5678
# Kill process or change N8N_PORT
```

### Supabase Connection Issues
```bash
# Check Supabase status
supabase status
# Restart Supabase
supabase stop && supabase start
```

### KeePassXC Access Denied
```bash
# Verify paths
echo $KEEPASS_DB_PATH
echo $KEEPASS_KEY_FILE
# Check file permissions
ls -la /mnt/persistent/keepass.*
```

## 🎓 Learning Resources

### Eva Core
- Read `/eva-core/README.md`
- Run `npm run demo` in eva-core directory
- Check examples in `eva-core/examples/`

### n8n Workflows
- Import examples from `/workflows/`
- Read `/docs/n8n-integration-guide.md`

### Cline (Claude Dev)
- Use Cmd/Ctrl + Shift + P → "Cline: New Task"
- Grant permissions incrementally
- Review all file changes before accepting

## 🚀 Advanced Usage

### Custom Docker Compose

Create `docker-compose.yml` for full stack:

```yaml
version: '3.8'
services:
  eva-core:
    build: ./eva-core
    environment:
      - CLAUDE_API_KEY=${CLAUDE_API_KEY}
    ports:
      - "3000:3000"
  
  n8n:
    image: n8nio/n8n
    ports:
      - "5678:5678"
    volumes:
      - n8n_data:/home/node/.n8n
    environment:
      - N8N_BASIC_AUTH_USER=${N8N_USER}
      - N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD}
```

### CI/CD with GitHub Actions

Use self-hosted runners on Azure VMs:

```yaml
name: Deploy to Azure VM
on: [push]
jobs:
  deploy:
    runs-on: [self-hosted, azure-vm]
    steps:
      - uses: actions/checkout@v3
      - name: Deploy
        run: ./deploy.sh
```

## 📝 Contributing

1. Always work in dev container
2. Use Cline for complex refactoring
3. Test with Eva before committing
4. Run `npm test` in each package
5. Update documentation

## 🆘 Support

- **Issues**: Create GitHub issue
- **Discussions**: Use GitHub Discussions
- **Cline**: Ask Cline to help debug

---

**Created**: 2026-01-02  
**Version**: 1.0.0  
**Maintainer**: Wallesters-org

✨ Happy Coding with AI! ✨
