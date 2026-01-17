---
name: wallestars-ai-orchestration
description: Multi-agent AI orchestration system for Wallestars. Use when coordinating specialized AI agents (code, data, devops, documentation specialists), managing conversation context with memory, or routing complex queries through supervisor-reviewed workflows.
---

# Wallestars AI Orchestration

Multi-agent AI system with specialized agents, memory management, and quality supervision for complex task handling.

## Architecture

```
User Query
    ↓
Router Agent → determines specialist
    ↓
Memory Agent → retrieves context
    ↓
Specialist Agent → processes request
    ↓
Supervisor Agent → reviews quality
    ↓
Final Response
```

## Core Agents

### 1. Router Agent
Routes requests to appropriate specialist based on query analysis.

**Routing Logic:**
- Code keywords → Code Specialist
- Data/SQL keywords → Data Specialist
- Deploy/infrastructure → DevOps Specialist
- Documentation → Documentation Specialist
- Default → General Agent

### 2. Memory Agent
Maintains long-term conversation context and retrieves relevant history.

**Capabilities:**
- Store conversation turns
- Semantic search previous interactions
- Maintain user preferences
- Track project context

### 3. Supervisor Agent
Quality control and coordination between agents.

**Responsibilities:**
- Review specialist responses
- Ensure consistency
- Coordinate multi-step workflows
- Escalate complex issues

### 4. Specialist Agents

#### Code Specialist
- Implementation tasks
- Debugging assistance
- Code review
- Architecture design

**Triggers:**
- "Implement..."
- "Fix bug..."
- "Review code..."
- "Design system..."

#### Data Specialist
- SQL queries
- Data analysis
- ETL workflows
- Report generation

**Triggers:**
- "Analyze data..."
- "Write SQL..."
- "Generate report..."
- "Extract information..."

#### DevOps Specialist
- Infrastructure management
- Deployment automation
- CI/CD workflows
- Monitoring setup

**Triggers:**
- "Deploy to..."
- "Setup CI/CD..."
- "Configure server..."
- "Monitor service..."

#### Documentation Specialist
- Technical writing
- API documentation
- User guides
- Architecture docs

**Triggers:**
- "Document..."
- "Write guide..."
- "Explain architecture..."
- "Create README..."

#### General Agent
Fallback for queries outside specialized domains.

## Commands

### Run Single Query

```bash
agent-run "Your query here"
agent-run "Implement JWT authentication" --verbose
```

Verbose mode shows:
- Routing decision
- Specialist selected
- Memory retrieved
- Supervisor review

### Interactive Chat Mode

```bash
agent-chat
```

Interactive session with:
- Multi-turn conversations
- Context preservation
- Agent switching
- Quality review

Session commands:
- `/exit` - End session
- `/clear` - Clear context
- `/stats` - Show statistics
- `/agents` - List available agents

### Statistics

```bash
agent-stats
```

Shows:
- Total queries processed
- Queries per specialist
- Average response time
- Memory usage
- Supervisor interventions

## Configuration

### Environment Variables

```bash
export ANTHROPIC_API_KEY="sk-ant-api03-..."
```

### Memory Storage

```bash
~/.config/wallestars/agent-memory/
├── conversations.db      # SQLite conversation history
├── embeddings.index      # Vector search index
└── preferences.json      # User preferences
```

## Workflow Examples

### Code Implementation

```bash
agent-run "Implement user authentication with JWT tokens"
```

Process:
1. Router → Code Specialist
2. Memory → Retrieves related auth code
3. Code Specialist → Generates implementation
4. Supervisor → Reviews for security
5. Response → Complete implementation

### Data Analysis

```bash
agent-run "Analyze user signup trends from last month"
```

Process:
1. Router → Data Specialist
2. Memory → Retrieves database schema
3. Data Specialist → Generates SQL + analysis
4. Supervisor → Validates query
5. Response → Analysis with insights

### Infrastructure Setup

```bash
agent-run "Setup CI/CD pipeline for Python project"
```

Process:
1. Router → DevOps Specialist
2. Memory → Retrieves project structure
3. DevOps Specialist → Creates workflow
4. Supervisor → Reviews configuration
5. Response → GitHub Actions YAML

### Documentation

```bash
agent-run "Document the authentication API endpoints"
```

Process:
1. Router → Documentation Specialist
2. Memory → Retrieves code structure
3. Documentation Specialist → Writes docs
4. Supervisor → Reviews clarity
5. Response → Formatted documentation

## Multi-Agent Collaboration

Some queries require multiple specialists:

```bash
agent-run "Build and deploy a REST API for user management"
```

Workflow:
1. Router → Identifies need for Code + DevOps
2. Code Specialist → Implements API
3. Supervisor → Reviews code
4. DevOps Specialist → Creates deployment
5. Supervisor → Final integration review
6. Response → Complete solution

## Memory Management

### Automatic Context

Memory Agent automatically:
- Stores all conversations
- Indexes by topic
- Retrieves relevant history
- Maintains project context

### Manual Context

```bash
agent-run "Remember: project uses Django 4.2" --store-preference
agent-run "What framework do we use?" --use-memory
```

### Clear Memory

```bash
agent-run --clear-memory
```

Clears:
- Conversation history (optional)
- Cached embeddings (optional)
- Preferences (with confirmation)

## Best Practices

1. **Be specific with queries**
   ```bash
   # Good
   agent-run "Implement JWT auth with refresh tokens using Django"
   
   # Less specific
   agent-run "Add authentication"
   ```

2. **Use verbose mode for learning**
   ```bash
   agent-run "query" --verbose
   ```

3. **Review multi-step workflows**
   ```bash
   # Complex tasks benefit from supervision
   agent-run "Refactor entire auth system" --verbose
   ```

4. **Leverage memory**
   ```bash
   # First interaction
   agent-run "Setup Django project with PostgreSQL"
   
   # Later - memory knows project structure
   agent-run "Add user model"
   ```

5. **Check statistics regularly**
   ```bash
   agent-stats  # Identify patterns and efficiency
   ```

## Troubleshooting

**API Key Error:**
```bash
export ANTHROPIC_API_KEY="sk-ant-api03-..."
agent-run "test query"
```

**Memory Issues:**
```bash
# Rebuild index
rm -rf ~/.config/wallestars/agent-memory/embeddings.index
agent-run "rebuild memory" --force
```

**Wrong Specialist Selected:**
```bash
# Use explicit routing
agent-run "query" --specialist code
```

**Slow Responses:**
```bash
# Check API limits
agent-stats
# Reduce memory retrieval
agent-run "query" --no-memory
```
