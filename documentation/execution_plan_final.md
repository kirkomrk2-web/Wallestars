# 🎯 ФИНАЛЕН ИЗПЪЛНИМ ПЛАН

След анализ на ChatGPT препоръките и моите разсъждения, ето **финалният оптимизиран план**, готов за **незабавно изпълнение**. 

---

## 📋 EXECUTIVE SUMMARY

**Цел:** Създаване на unified knowledge base система с long-term memory за multi-AI agent coordination

**Времева рамка:** 3-4 дни (accelerated) vs 2 седмици (standard)

**Подход:** Hybrid (GitHub + Supabase + n8n + RAGFlow + ContextStream)

**Разходи:** ~$5 допълнително + $100-195/месец operational

**Ключови технологии:**
- ✅ GitHub Codespaces (dev environment)
- ✅ Supabase pgvector (vector DB)
- ✅ n8n self-hosted (orchestration)
- ✅ RAGFlow (intelligent chunking)
- ✅ OpenAI (embeddings)
- ✅ Claude (reasoning)
- ✅ ContextStream local-only (productivity)

---

## 🚨 КРИТИЧНО ВАЖНА ПЪРВА СТЪПКА

### **СТЪПКА 0: SECURITY AUDIT (НАПРАВИ СЕГА! )**

```bash
# 1. Scan за exposed secrets в GitHub repos
cd ~/projects
git clone https://github.com/Wallesters-org/wallesters.org
git clone https://github.com/kirkomrk2-web/registry-stagehand-worker

# Install gitleaks
brew install gitleaks  # macOS
# or
wget https://github.com/gitleaks/gitleaks/releases/download/v8.18.1/gitleaks_8.18.1_linux_x64.tar.gz
tar -xzf gitleaks_8.18.1_linux_x64.tar.gz

# Scan all repos
for repo in wallesters.org registry-stagehand-worker; do
  echo "🔍 Scanning $repo..."
  cd $repo
  gitleaks detect --no-git --verbose
  cd ..
done

# 2. If secrets found (ChatGPT mentioned exposed credentials):
# Rotate IMMEDIATELY: 
# - n8n credentials
# - Supabase service_role_key
# - OpenAI API key
# - smstome credentials
# - All other API keys

# 3. Add to .gitignore (all repos)
cat >> .gitignore << 'EOF'
# Secrets
.env
.env.*
credentials/
secrets/
*. key
*.pem

# ContextStream local data
. contextstream/

# n8n local data
.n8n/
EOF

git add .gitignore
git commit -m "security:  Add sensitive files to .gitignore"
git push

# 4. Enable GitHub secret scanning
gh api -X PATCH /repos/Wallesters-org/wallesters.org \
  -f security_and_analysis='{"secret_scanning": {"status":"enabled"},"secret_scanning_push_protection":{"status":"enabled"}}'

gh api -X PATCH /repos/kirkomrk2-web/registry-stagehand-worker \
  -f security_and_analysis='{"secret_scanning":{"status":"enabled"},"secret_scanning_push_protection":{"status":"enabled"}}'
```

**⏱️ Време:  30 минути**

**🚨 НЕ ПРОДЪЛЖАВАЙТЕ ПО-НАТАТЪК ДОКАТО НЕ ROTATE-НЕТЕ EXPOSED CREDENTIALS! **

---

## 🏗️ ФАЗА 1: FOUNDATION SETUP (ДЕН 1 - 4 часа)

### **1. 1 GitHub Codespace Setup (15 минути)**

```bash
# In your main repo (kirkomrk2-web/registry-stagehand-worker)
mkdir -p . devcontainer
```

**Създайте `.devcontainer/devcontainer. json`:**

```json
{
  "name": "Wallesters Knowledge Base Dev",
  "image": "mcr.microsoft.com/devcontainers/typescript-node:20",
  
  "features": {
    "ghcr.io/devcontainers/features/docker-in-docker:2":  {},
    "ghcr.io/devcontainers/features/github-cli:1": {},
    "ghcr.io/devcontainers-contrib/features/supabase-cli:1": {}
  },
  
  "customizations": {
    "vscode": {
      "extensions":  [
        "saoudrizwan.claude-dev",
        "github.copilot",
        "contextstream.contextstream",
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode"
      ],
      "settings": {
        "contextstream.mode": "local-only",
        "contextstream.syncToCloud": false,
        "contextstream.indexPaths": ["docs/", "n8n_workflows/", "supabase/"],
        "contextstream.autoStart": true,
        "claude-dev.maxTokens": 200000
      }
    }
  },
  
  "forwardPorts": [5678, 9380, 5432],
  
  "postCreateCommand": "bash .devcontainer/setup. sh",
  
  "remoteEnv": {
    "SUPABASE_URL": "${localEnv:SUPABASE_URL}",
    "SUPABASE_SERVICE_ROLE_KEY": "${localEnv: SUPABASE_SERVICE_ROLE_KEY}",
    "OPENAI_API_KEY": "${localEnv:OPENAI_API_KEY}",
    "CLAUDE_API_KEY": "${localEnv:CLAUDE_API_KEY}"
  }
}
```

**Създайте `.devcontainer/setup.sh`:**

```bash
#!/bin/bash
set -e

echo "🚀 Setting up Wallesters dev environment..."

# Install dependencies
npm install

# Install ContextStream MCP server
npm install -g @contextstream/mcp-server

# Setup Supabase
supabase login --token ${SUPABASE_ACCESS_TOKEN}
supabase link --project-ref ansiaiuaygcfztabtknl

# Pull latest schema
supabase db pull

# Generate TypeScript types
supabase gen types typescript --local > types/supabase.ts

echo "✅ Dev environment ready!"
```

**Commit и push:**

```bash
git add .devcontainer/
git commit -m "feat: Add Codespace configuration"
git push
```

**Създайте Codespace:**

```bash
# Via GitHub CLI
gh codespace create --repo kirkomrk2-web/registry-stagehand-worker --branch main

# Or via GitHub UI: 
# Go to repo → Code button → Codespaces tab → Create codespace on main
```

**⏱️ Време: 15 минути (първи път), 2 минути след това**

---

### **1.2 Supabase Schema Deployment (30 минути)**

**Създайте миграционни файлове:**

```bash
# In Codespace terminal
mkdir -p supabase/migrations
```

**`supabase/migrations/20250101000000_vector_db_foundation.sql`:**

```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Main knowledge base table
CREATE TABLE project_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repo_org TEXT NOT NULL,
  repo_name TEXT NOT NULL,
  branch_name TEXT DEFAULT 'main',
  file_path TEXT NOT NULL,
  content TEXT NOT NULL,
  content_hash TEXT NOT NULL UNIQUE,
  embedding VECTOR(1536),
  chunk_index INT DEFAULT 0,
  total_chunks INT DEFAULT 1,
  source_type TEXT NOT NULL, -- 'docs', 'code', 'workflow', 'ai_session'
  language TEXT, -- 'markdown', 'javascript', 'python', etc.
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_project_knowledge_repo ON project_knowledge(repo_org, repo_name);
CREATE INDEX idx_project_knowledge_source ON project_knowledge(source_type);
CREATE INDEX idx_project_knowledge_embedding ON project_knowledge 
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_project_knowledge_content_search ON project_knowledge 
  USING gin (to_tsvector('english', content));

-- AI sessions tracking
CREATE TABLE ai_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_type TEXT NOT NULL, -- 'cline', 'codex', 'copilot', 'chatgpt', 'contextstream'
  source_platform TEXT NOT NULL,
  session_data JSONB NOT NULL,
  summary TEXT,
  embedding VECTOR(1536),
  related_repos TEXT[] DEFAULT '{}',
  related_branches TEXT[] DEFAULT '{}',
  agent_task_type TEXT, -- 'bug_fix', 'feature', 'documentation', 'review'
  session_duration_minutes INT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_sessions_type ON ai_sessions(session_type);
CREATE INDEX idx_ai_sessions_repos ON ai_sessions USING gin(related_repos);
CREATE INDEX idx_ai_sessions_embedding ON ai_sessions 
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 50);

-- Session correlation
CREATE TABLE ai_session_correlation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic TEXT NOT NULL,
  related_sessions UUID[] NOT NULL,
  aggregated_insights TEXT,
  consensus_reached BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Search function with ranking
CREATE OR REPLACE FUNCTION search_knowledge_ranked(
  query_embedding VECTOR(1536),
  repo_filter TEXT[] DEFAULT NULL,
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 10,
  context_budget_tokens INT DEFAULT 8000
)
RETURNS TABLE (
  id UUID,
  repo_org TEXT,
  repo_name TEXT,
  file_path TEXT,
  content TEXT,
  similarity FLOAT,
  estimated_tokens INT,
  priority_score FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH ranked_results AS (
    SELECT
      pk. id,
      pk.repo_org,
      pk.repo_name,
      pk.file_path,
      pk.content,
      1 - (pk.embedding <=> query_embedding) AS similarity,
      LENGTH(pk.content) / 4 AS estimated_tokens,
      -- Priority:  similarity (60%) + recency (20%) + importance (20%)
      (1 - (pk.embedding <=> query_embedding)) * 0.6 +
      (1 - EXTRACT(EPOCH FROM (NOW() - pk.updated_at)) / 2592000) * 0.2 +
      (CASE 
        WHEN pk.file_path ILIKE '%PROJECT_CONTEXT%' THEN 0.2
        WHEN pk.file_path ILIKE '%ARCHITECTURE%' THEN 0.15
        WHEN pk.file_path ILIKE '%README%' THEN 0.12
        WHEN pk.source_type = 'docs' THEN 0.08
        ELSE 0.05
      END) AS priority_score
    FROM project_knowledge pk
    WHERE 
      (repo_filter IS NULL OR 
       CONCAT(pk.repo_org, '/', pk.repo_name) = ANY(repo_filter))
      AND 1 - (pk.embedding <=> query_embedding) > match_threshold
  ),
  cumulative_tokens AS (
    SELECT 
      *,
      SUM(estimated_tokens) OVER (ORDER BY priority_score DESC) AS running_total
    FROM ranked_results
  )
  SELECT 
    id, repo_org, repo_name, file_path, content, 
    similarity, estimated_tokens, priority_score
  FROM cumulative_tokens
  WHERE running_total <= context_budget_tokens
  ORDER BY priority_score DESC
  LIMIT match_count;
END;
$$;

-- Multi-repo search function
CREATE OR REPLACE FUNCTION search_knowledge_multi_repo(
  query_embedding VECTOR(1536),
  repo_filter TEXT[] DEFAULT NULL,
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  repo_org TEXT,
  repo_name TEXT,
  file_path TEXT,
  content TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pk.id,
    pk.repo_org,
    pk.repo_name,
    pk.file_path,
    pk.content,
    1 - (pk.embedding <=> query_embedding) AS similarity
  FROM project_knowledge pk
  WHERE 
    (repo_filter IS NULL OR 
     CONCAT(pk. repo_org, '/', pk. repo_name) = ANY(repo_filter))
    AND 1 - (pk.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

-- View for monitoring
CREATE OR REPLACE VIEW system_health AS
SELECT
  (SELECT COUNT(*) FROM project_knowledge) AS total_knowledge_items,
  (SELECT COUNT(*) FROM project_knowledge WHERE created_at > NOW() - INTERVAL '24 hours') AS new_items_24h,
  (SELECT COUNT(*) FROM ai_sessions) AS total_ai_sessions,
  (SELECT COUNT(*) FROM ai_sessions WHERE created_at > NOW() - INTERVAL '7 days') AS sessions_last_week,
  (SELECT COUNT(*) FROM project_knowledge WHERE embedding IS NULL) AS items_without_embeddings,
  (SELECT MAX(updated_at) FROM project_knowledge) AS last_sync;
```

**Deploy schema:**

```bash
# In Codespace
supabase db push

# Verify
supabase db diff
```

**⏱️ Време: 30 минути**

---

### **1.3 Hostinger VPS Docker Stack (1 час)**

**SSH into your VPS:**

```bash
ssh administrator@your-vps-ip
```

**Create project directory:**

```bash
sudo mkdir -p /opt/wallesters-stack
cd /opt/wallesters-stack
```

**Create `docker-compose.yml`:**

```yaml
version: '3.8'

services:
  # n8n orchestration
  n8n: 
    image: n8nio/n8n:latest
    container_name: n8n_production
    restart: unless-stopped
    ports: 
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=${N8N_USER}
      - N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD}
      - N8N_HOST=${N8N_HOST}
      - N8N_PORT=5678
      - N8N_PROTOCOL=https
      - NODE_ENV=production
      - WEBHOOK_URL=https://${N8N_HOST}/
      - GENERIC_TIMEZONE=Europe/Sofia
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=n8n
      - DB_POSTGRESDB_USER=n8n
      - DB_POSTGRESDB_PASSWORD=${POSTGRES_PASSWORD}
      # Credentials
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - CLAUDE_API_KEY=${CLAUDE_API_KEY}
      - GITHUB_TOKEN=${GITHUB_TOKEN}
    volumes:
      - n8n_data:/home/node/.n8n
      - ./workflows:/workflows: ro
    depends_on:
      - postgres
      - redis
    networks:
      - wallesters_network
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:5678/healthz"]
      interval: 30s
      timeout: 10s
      retries: 3

  # RAGFlow for intelligent chunking
  ragflow:
    image: infiniflow/ragflow:latest
    container_name: ragflow
    restart: unless-stopped
    ports:
      - "9380:9380"
    environment:
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - MINIO_HOST=minio
      - MINIO_PORT=9000
    depends_on:
      - redis
      - minio
    networks: 
      - wallesters_network

  # PostgreSQL for n8n workflow data
  postgres:
    image: postgres:15-alpine
    container_name: n8n_postgres
    restart:  unless-stopped
    environment: 
      - POSTGRES_DB=n8n
      - POSTGRES_USER=n8n
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - wallesters_network

  # Redis for caching and queues
  redis:
    image:  redis:alpine
    container_name: redis
    restart: unless-stopped
    volumes:
      - redis_data:/data
    networks:
      - wallesters_network

  # MinIO for RAGFlow file storage
  minio:
    image: minio/minio: latest
    container_name: minio
    restart: unless-stopped
    command: server /data --console-address ":9001"
    environment:
      - MINIO_ROOT_USER=${MINIO_USER}
      - MINIO_ROOT_PASSWORD=${MINIO_PASSWORD}
    volumes:
      - minio_data:/data
    ports:
      - "9001:9001"
    networks:
      - wallesters_network

  # Nginx reverse proxy
  nginx:
    image: nginx:alpine
    container_name: nginx_proxy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes: 
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl: ro
    depends_on:
      - n8n
      - ragflow
    networks: 
      - wallesters_network

volumes:
  n8n_data:
  postgres_data: 
  redis_data:
  minio_data: 

networks:
  wallesters_network:
    driver: bridge
```

**Create `.env` file:**

```bash
cat > . env << 'EOF'
# n8n
N8N_USER=admin
N8N_PASSWORD=CHANGE_THIS_TO_STRONG_PASSWORD
N8N_HOST=n8n.your-domain.com

# PostgreSQL
POSTGRES_PASSWORD=CHANGE_THIS_TO_STRONG_PASSWORD

# MinIO
MINIO_USER=minioadmin
MINIO_PASSWORD=CHANGE_THIS_TO_STRONG_PASSWORD

# External Services
SUPABASE_URL=https://ansiaiuaygcfztabtknl.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
OPENAI_API_KEY=YOUR_OPENAI_KEY
CLAUDE_API_KEY=YOUR_CLAUDE_KEY
GITHUB_TOKEN=YOUR_GITHUB_PAT
EOF

chmod 600 .env
```

**Create basic `nginx.conf`:**

```nginx
events {
    worker_connections 1024;
}

http {
    upstream n8n {
        server n8n:5678;
    }

    upstream ragflow {
        server ragflow:9380;
    }

    server {
        listen 80;
        server_name n8n.your-domain.com;

        location / {
            proxy_pass http://n8n;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }

    server {
        listen 80;
        server_name ragflow.your-domain.com;

        location / {
            proxy_pass http://ragflow;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
```

**Create deployment script:**

```bash
cat > deploy.sh << 'EOF'
#!/bin/bash
set -e

echo "🚀 Deploying Wallesters Stack..."

# Load environment
if [ !  -f .env ]; then
    echo "❌ . env file not found!"
    exit 1
fi
source .env

# Pull latest images
docker-compose pull

# Stop existing containers
docker-compose down

# Backup data
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
if [ -d "n8n_data" ]; then
    cp -r n8n_data "$BACKUP_DIR/"
    echo "✅ Backup created: $BACKUP_DIR"
fi

# Start services
docker-compose up -d

# Wait for health checks
echo "⏳ Waiting for services..."
sleep 30

# Check status
docker-compose ps

echo "✅ Deployment complete!"
echo "n8n:  http://${N8N_HOST}"
echo "RAGFlow: http://ragflow.your-domain.com"
EOF

chmod +x deploy.sh
```

**Deploy:**

```bash
./deploy.sh
```

**⏱️ Време: 1 час (първи път), 5 минути след това**

---

### **1.4 Bulk Knowledge Import (1.5 часа)**

**Back in Codespace, create import script:**

```bash
mkdir -p automation_scripts
```

**`automation_scripts/bulk-import.mjs`:**

```javascript
#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { Octokit } from '@octokit/rest';
import OpenAI from 'openai';
import crypto from 'crypto';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process. env.SUPABASE_SERVICE_ROLE_KEY
);
const octokit = new Octokit({ auth: process.env. GITHUB_TOKEN });
const openai = new OpenAI({ apiKey: process.env. OPENAI_API_KEY });

const REPOS = [
  'Wallesters-org/wallesters. org',
  'Wallesters-org/horizons-export-dev',
  'kirkomrk2-web/registry-stagehand-worker'
];

const CHUNK_SIZE = 1500;
const CHUNK_OVERLAP = 200;

async function main() {
  console.log('🚀 Starting bulk import.. .');
  
  for (const repoFullName of REPOS) {
    await importRepo(repoFullName);
  }
  
  console.log('🎉 Bulk import complete!');
  
  // Print stats
  const { data: stats } = await supabase.rpc('system_health');
  console.log('\n📊 System Stats:');
  console.log(`Total items: ${stats[0].total_knowledge_items}`);
  console.log(`New items (24h): ${stats[0].new_items_24h}`);
}

async function importRepo(repoFullName) {
  const [owner, repo] = repoFullName.split('/');
  console.log(`\n📦 Importing ${repoFullName}...`);
  
  try {
    // Get file tree
    const { data: tree } = await octokit.git.getTree({
      owner,
      repo,
      tree_sha: 'main',
      recursive: true
    });
    
    // Filter for markdown and code files
    const relevantFiles = tree.tree. filter(f => 
      f.type === 'blob' &&
      (f.path.endsWith('.md') || 
       f.path.endsWith('.js') || 
       f.path.endsWith('.mjs') ||
       f.path.endsWith('.json') && f.path.includes('n8n'))
    );
    
    console.log(`Found ${relevantFiles.length} files to import`);
    
    // Process in batches of 5
    for (let i = 0; i < relevantFiles. length; i += 5) {
      const batch = relevantFiles.slice(i, i + 5);
      await Promise.all(batch.map(file => 
        processFile(owner, repo, file).catch(err => {
          console.error(`Error processing ${file.path}:`, err.message);
        })
      ));
      console.log(`Processed ${Math.min(i + 5, relevantFiles. length)}/${relevantFiles.length}`);
    }
    
    console.log(`✅ Completed ${repoFullName}`);
  } catch (error) {
    console.error(`❌ Failed to import ${repoFullName}:`, error.message);
  }
}

async function processFile(owner, repo, file) {
  // Download content
  const { data } = await octokit.repos.getContent({
    owner,
    repo,
    path:  file.path,
    ref: 'main'
  });
  
  if (!data.content) return; // Skip if no content
  
  const content = Buffer.from(data.content, 'base64').toString('utf8');
  
  // Skip very small files
  if (content. length < 50) return;
  
  // Determine source type and language
  const sourceType = file.path.endsWith('.md') ? 'docs' : 
                    file.path.includes('n8n') ? 'workflow' : 'code';
  const language = file.path.endsWith('.md') ? 'markdown' : 
                  file.path.endsWith('.js') || file.path.endsWith('.mjs') ? 'javascript' :
                  file.path.endsWith('.json') ? 'json' : 'text';
  
  // Chunk content
  const chunks = intelligentChunk(content);
  
  // Generate embeddings (batch)
  const embeddingTexts = chunks.map(c => c.text);
  const embeddingResponse = await openai.embeddings. create({
    model: 'text-embedding-3-large',
    input: embeddingTexts
  });
  
  // Prepare records
  const records = chunks.map((chunk, i) => ({
    repo_org: owner,
    repo_name: repo,
    branch_name: 'main',
    file_path: file.path,
    content: chunk.text,
    content_hash: generateHash(owner, repo, file.path, i),
    embedding: embeddingResponse.data[i].embedding,
    chunk_index: i,
    total_chunks: chunks.length,
    source_type: sourceType,
    language: language,
    metadata: {
      file_size: data.size,
      file_sha: data.sha,
      chunk_char_start: chunk.start,
      chunk_char_end: chunk.end
    }
  }));
  
  // Upsert to Supabase (on conflict do update)
  const { error } = await supabase
    .from('project_knowledge')
    .upsert(records, { onConflict: 'content_hash' });
  
  if (error) {
    throw new Error(`Supabase error: ${error.message}`);
  }
}

function intelligentChunk(content) {
  const chunks = [];
  let start = 0;
  
  while (start < content.length) {
    let end = Math.min(start + CHUNK_SIZE, content.length);
    
    // Try to break at paragraph
    if (end < content.length) {
      const lastNewline = content.lastIndexOf('\n\n', end);
      if (lastNewline > start + CHUNK_SIZE / 2) {
        end = lastNewline;
      }
    }
    
    chunks.push({
      text: content.substring(start, end).trim(),
      start,
      end
    });
    
    start = end - CHUNK_OVERLAP;
  }
  
  return chunks;
}

function generateHash(owner, repo, path, chunkIndex) {
  return crypto
    .createHash('sha256')
    .update(`${owner}/${repo}/${path}#${chunkIndex}`)
    .digest('hex');
}

main().catch(console.error);
```

**Install dependencies and run:**

```bash
npm install @supabase/supabase-js @octokit/rest openai

# Run import
node automation_scripts/bulk-import.mjs
```

**⏱️ Време:  1-1.5 часа (depends on repo size)**

---

## 🤖 ФАЗА 2: AI AGENTS & WORKFLOWS (ДЕН 2 - 3 часа)

### **2.1 n8n Workflow Templates (1 час)**

**Create workflow templates directory:**

```bash
mkdir -p n8n_workflows
```

**Use the provided `__RAG_Agent_Demo.json` and `Upload_to_Supabase_Demo.json`:**

```bash
# Copy provided files to n8n_workflows/
cp /path/to/__RAG_Agent_Demo.json n8n_workflows/
cp /path/to/Upload_to_Supabase_Demo. json n8n_workflows/
```

**Create additional workflow:  `n8n_workflows/github-multi-repo-indexer.json`:**

```json
{
  "name": "GitHub Multi-Repo Knowledge Indexer",
  "nodes": [
    {
      "parameters": {
        "path": "github-webhook",
        "options": {}
      },
      "name": "GitHub Webhook",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300]
    },
    {
      "parameters": {
        "jsCode": "const repoFullName = $json. repository.full_name;\nconst INDEXED_REPOS = [\n  'Wallesters-org/wallesters.org',\n  'Wallesters-org/horizons-export-dev',\n  'kirkomrk2-web/registry-stagehand-worker'\n];\n\nif (! INDEXED_REPOS.includes(repoFullName)) {\n  return [];\n}\n\nconst [org, repo] = repoFullName.split('/');\n\nreturn [{\n  json: {\n    org,\n    repo,\n    branch: $json.ref. replace('refs/heads/', ''),\n    commits: $json.commits\n  }\n}];"
      },
      "name": "Filter Repos",
      "type": "n8n-nodes-base.code",
      "position": [450, 300]
    },
    {
      "parameters": {
        "authentication": "predefinedCredentialType",
        "nodeCredentialType": "githubApi",
        "url": "={{ $json.commits[0].url }}",
        "options": {}
      },
      "name":  "Get Commit Details",
      "type": "n8n-nodes-base.httpRequest",
      "position": [650, 300]
    },
    {
      "parameters":  {
        "jsCode": "const files = $json.files || [];\nconst relevantFiles = files.filter(f => \n  (f.filename.endsWith('.md') || \n   f.filename.endsWith('.js') || \n   f.filename.endsWith('.mjs') ||\n   (f.filename.endsWith('.json') && f.filename.includes('n8n')))\n  && f.status !== 'removed'\n);\n\nreturn relevantFiles.map(f => ({\n  json: {\n    org:  $('Filter Repos').item. json.org,\n    repo: $('Filter Repos').item.json.repo,\n    file_path: f.filename,\n    raw_url: f.raw_url,\n    status: f.status,\n    sha: f.sha\n  }\n}));"
      },
      "name": "Filter Files",
      "type": "n8n-nodes-base. code",
      "position": [850, 300]
    },
    {
      "parameters": {
        "url": "={{ $json.raw_url }}",
        "options": {}
      },
      "name": "Download Content",
      "type": "n8n-nodes-base.httpRequest",
      "position": [1050, 300]
    },
    {
      "parameters": {
        "resource": "embedding",
        "model": "text-embedding-3-large",
        "text": "={{ $json.data }}"
      },
      "name": "Generate Embedding",
      "type": "n8n-nodes-base.openAi",
      "position": [1250, 300]
    },
    {
      "parameters":  {
        "operation": "upsert",
        "tableId": "project_knowledge",
        "fieldsUi": {
          "fieldValues": [
            {
              "fieldId": "repo_org",
              "fieldValue": "={{ $('Filter Files').item.json.org }}"
            },
            {
              "fieldId": "repo_name",
              "fieldValue":  "={{ $('Filter Files').item.json.repo }}"
            },
            {
              "fieldId": "file_path",
              "fieldValue": "={{ $('Filter Files').item.json.file_path }}"
            },
            {
              "fieldId": "content",
              "fieldValue": "={{ $('Download Content').item.json.data }}"
            },
            {
              "fieldId": "content_hash",
              "fieldValue": "={{ $('Filter Files').item.json.sha }}"
            },
            {
              "fieldId": "embedding",
              "fieldValue": "={{ $json.data[0].embedding }}"
            },
            {
              "fieldId": "source_type",
              "fieldValue": "docs"
            }
          ]
        }
      },
      "name": "Store in Supabase",
      "type": "n8n-nodes-base.supabase",
      "position": [1450, 300]
    }
  ],
  "connections": {
    "GitHub Webhook": {
      "main": [[{"node": "Filter Repos"}]]
    },
    "Filter Repos": {
      "main":  [[{"node": "Get Commit Details"}]]
    },
    "Get Commit Details": {
      "main": [[{"node": "Filter Files"}]]
    },
    "Filter Files": {
      "main": [[{"node": "Download Content"}]]
    },
    "Download Content": {
      "main": [[{"node": "Generate Embedding"}]]
    },
    "Generate Embedding": {
      "main": [[{"node":  "Store in Supabase"}]]
    }
  }
}
```

**Commit workflows:**

```bash
git add n8n_workflows/
git commit -m "feat: Add n8n workflow templates"
git push
```

**⏱️ Време: 1 час**

---

### **2.2 ContextStream Setup (30 минути)**

**In Codespace (already auto-configured via devcontainer):**

```bash
# Verify ContextStream is running
ps aux | grep contextstream

# If not, start manually
npx @contextstream/mcp-server --local &
```

**Test integration with Cline:**

1. Open Cline in VS Code sidebar
2. Ask:  "What files handle n8n workflow management?"
3. Verify ContextStream suggests relevant files

**⏱️ Време: 30 минути**

---

### **2.3 Deploy Workflows to n8n (1 час)**

**Create import script:**

```bash
cat > automation_scripts/import-workflows.sh << 'EOF'
#!/bin/bash
set -e

N8N_API="https://your-n8n-vps.com/api/v1"
N8N_API_KEY=$(gh secret get N8N_API_KEY)

for workflow in n8n_workflows/*.json; do
  echo "Importing $(basename $workflow)..."
  curl -X POST "$N8N_API/workflows/import" \
    -H "X-N8N-API-KEY: $N8N_API_KEY" \
    -H "Content-Type: application/json" \
    -d @"$workflow"
  echo "✅ Imported"
done

echo "🎉 All workflows imported!"
EOF

chmod +x automation_scripts/import-workflows.sh
```

**Run import:**

```bash
# Get n8n API key first (from n8n UI:  Settings → API)
gh secret set N8N_API_KEY

# Import workflows
./automation_scripts/import-workflows. sh
```

**⏱️ Време: 30 минути (excluding workflow edits)**

---

## 📊 ФАЗА 3: TESTING & MONITORING (ДЕН 3 - 2 часа)

### **3.1 End-to-End Testing (1 час)**

**Test vector search:**

```javascript
// automation_scripts/test-vector-search.mjs
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
  process.env. SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const openai = new OpenAI({ apiKey: process.env. OPENAI_API_KEY });

async function testSearch(query) {
  console.log(`\n🔍 Searching for: "${query}"`);
  
  // Generate query embedding
  const embeddingResponse = await openai. embeddings.create({
    model: 'text-embedding-3-large',
    input: query
  });
  const queryEmbedding = embeddingResponse.data[0].embedding;
  
  // Search
  const { data, error } = await supabase. rpc('search_knowledge_ranked', {
    query_embedding:  queryEmbedding,
    match_threshold: 0.7,
    match_count: 5
  });
  
  if (error) {
    console.error('Search error:', error);
    return;
  }
  
  console.log(`Found ${data.length} results:\n`);
  data.forEach((result, i) => {
    console.log(`${i + 1}. ${result.repo_org}/${result.repo_name}/${result.file_path}`);
    console.log(`   Similarity: ${(result.similarity * 100).toFixed(1)}%`);
    console.log(`   Priority: ${result.priority_score. toFixed(3)}`);
    console.log(`   Preview: ${result.content. substring(0, 100)}.. .\n`);
  });
}

// Run tests
(async () => {
  await testSearch('How does Wallester automation work?');
  await testSearch('n8n workflow for SMS verification');
  await testSearch('Supabase schema setup');
})();
```

**Run tests:**

```bash
node automation_scripts/test-vector-search.mjs
```

**⏱️ Време:  30 минути**

---

### **3.2 Setup Monitoring (1 час)**

**Create health check workflow in n8n:**

```json
{
  "name": "System Health Monitor",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [{"field": "hours", "hoursInterval": 1}]
        }
      },
      "name":  "Hourly Trigger",
      "type": "n8n-nodes-base.scheduleTrigger",
      "position":  [250, 300]
    },
    {
      "parameters": {
        "operation": "runSql",
        "query": "SELECT * FROM system_health"
      },
      "name": "Check Health",
      "type": "n8n-nodes-base.supabase",
      "position":  [450, 300]
    },
    {
      "parameters": {
        "jsCode": "const health = $json[0];\nconst alerts = [];\n\nif (health. items_without_embeddings > 10) {\n  alerts.push(`⚠️ ${health.items_without_embeddings} items missing embeddings`);\n}\n\nif (health.new_items_24h === 0) {\n  alerts.push('⚠️ No new items in 24 hours - indexing may be down');\n}\n\nconst hoursSinceSync = (Date.now() - new Date(health.last_sync)) / 3600000;\nif (hoursSinceSync > 6) {\n  alerts.push(`⚠️ Last sync was ${hoursSinceSync.toFixed(1)} hours ago`);\n}\n\nreturn [{\n  json: {\n    health,\n    alerts,\n    has_alerts: alerts.length > 0\n  }\n}];"
      },
      "name":  "Evaluate",
      "type": "n8n-nodes-base.code",
      "position": [650, 300]
    },
    {
      "parameters": {
        "conditions": {
          "boolean": [{"value1": "={{ $json.has_alerts }}", "value2": true}]
        }
      },
      "name": "Has Alerts? ",
      "type": "n8n-nodes-base.if",
      "position": [850, 300]
    },
    {
      "parameters": {
        "chatId": "YOUR_TELEGRAM_CHAT_ID",
        "text": "={{ '🚨 System Health Alert\\n\\n' + $json.alerts.join('\\n') }}"
      },
      "name": "Send Telegram Alert",
      "type": "n8n-nodes-base. telegram",
      "position": [1050, 200]
    }
  ]
}
```

**⏱️ Време: 30 минути**

---

## 🎯 ФАЗА 4: DOCUMENTATION & HANDOFF (ДЕН 3-4 - 2 часа)

### **4.1 Auto-Generate PROJECT_CONTEXT.md (1 час)**

**Create workflow (in n8n):**

```json
{
  "name":  "Auto-Update PROJECT_CONTEXT",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [{"field": "days", "daysInterval": 1}]
        }
      },
      "name": "Daily Trigger",
      "type": "n8n-nodes-base.scheduleTrigger",
      "position": [250, 300]
    },
    {
      "parameters": {
        "operation":  "getMany",
        "tableId": "ai_sessions",
        "returnAll": false,
        "limit": 20,
        "sort": [{"field": "created_at", "direction": "desc"}]
      },
      "name": "Get Recent Sessions",
      "type": "n8n-nodes-base. supabase",
      "position": [450, 300]
    },
    {
      "parameters": {
        "authentication": "predefinedCredentialType",
        "nodeCredentialType": "githubApi",
        "owner": "kirkomrk2-web",
        "repository": "registry-stagehand-worker",
        "filePath":  "PROJECT_CONTEXT.md"
      },
      "name":  "Read Current Context",
      "type": "n8n-nodes-base. github",
      "position": [450, 450]
    },
    {
      "parameters": {
        "modelId": "claude-3-5-sonnet-20241022",
        "prompt": "You are updating PROJECT_CONTEXT.md.\n\nRecent AI Sessions:\n{{ $('Get Recent Sessions').all().map(s => '- ' + s.json.session_type + ': ' + s.json.summary).join('\\n') }}\n\nCurrent Content:\n{{ $('Read Current Context').item.json.content }}\n\nTask: Update the 'Current Status' section with this week's progress.  Keep structure, refresh content."
      },
      "name":  "Generate Update",
      "type": "@n8n/n8n-nodes-langchain.lmChatAnthropic",
      "position":  [650, 375]
    },
    {
      "parameters": {
        "authentication": "predefinedCredentialType",
        "nodeCredentialType": "githubApi",
        "operation": "edit",
        "owner": "kirkomrk2-web",
        "repository": "registry-stagehand-worker",
        "filePath": "PROJECT_CONTEXT.md",
        "commitMessage": "chore: Auto-update PROJECT_CONTEXT.md",
        "fileContent": "={{ $json.text }}"
      },
      "name": "Commit Update",
      "type": "n8n-nodes-base.github",
      "position": [850, 375]
    }
  ]
}
```

**⏱️ Време: 1 час**

---

### **4.2 Create Team Documentation (1 час)**

**In Codespace, create `QUICKSTART.md`:**

````markdown
# 🚀 QUICKSTART GUIDE

## For New Team Members

### 1. Get Access
- GitHub:  Request access to Wallesters-org
- Supabase: Login with GitHub at supabase.com
- n8n: Get credentials from admin

### 2. Start Development

**Option A: GitHub Codespaces (Recommended)**
```bash
# Create codespace
gh codespace create --repo kirkomrk2-web/registry-stagehand-worker

# Or via UI:  Code → Codespaces → New codespace
```

**Option B: Local Setup**
```bash
git clone https://github.com/kirkomrk2-web/registry-stagehand-worker
cd registry-stagehand-worker
npm install
supabase login
supabase link --project-ref ansiaiuaygcfztabtknl
```

### 3. Query the Knowledge Base

**From Code:**
```javascript
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// Generate query embedding
const embedding = await openai.embeddings. create({
  model: 'text-embedding-3-large',
  input: 'your query here'
});

// Search
const { data } = await supabase.rpc('search_knowledge_ranked', {
  query_embedding: embedding. data[0].embedding,
  match_count: 5
});

console.log(data);
```

**From Cline:**
Just ask naturally!  ContextStream auto-loads relevant context.

**From n8n:**
Use the "RAG Agent" workflow - chat interface at https://n8n.your-domain.com

### 4. Common Tasks

**Add new documentation:**
1. Create/edit . md file in `docs/`
2. Commit and push
3. GitHub webhook auto-indexes to vector DB

**Create new workflow:**
1. Build in n8n UI
2. Export JSON
3. Save to `n8n_workflows/` and commit

**Query across repos:**
```javascript
const { data } = await supabase.rpc('search_knowledge_multi_repo', {
  query_embedding: embedding,
  repo_filter: [
    'Wallesters-org/wallesters.org',
    'kirkomrk2-web/registry-stagehand-worker'
  ]
});
```

## Troubleshooting

**"No results from vector search"**
- Check if files are indexed: `SELECT COUNT(*) FROM project_knowledge;`
- Run bulk import: `node automation_scripts/bulk-import.mjs`

**"Cline not finding context"**
- Verify ContextStream is running:  `ps aux | grep contextstream`
- Restart:  `npx @contextstream/mcp-server --local &`

**"n8n workflow failing"**
- Check logs: `docker logs n8n_production`
- Verify credentials in n8n UI

## Resources

- **PROJECT_CONTEXT.md** - Current state (auto-updated daily)
- **Architecture:** `docs/02-ARCHITECTURE/`
- **n8n Workflows:** https://n8n.your-domain.com
- **Supabase Dashboard:** https://supabase.com/dashboard/project/ansiaiuaygcfztabtknl
````

**Commit:**

```bash
git add QUICKSTART.md
git commit -m "docs: Add team quickstart guide"
git push
```

**⏱️ Време: 1 час**

---

## ✅ VERIFICATION CHECKLIST

```bash
# Run this checklist at the end of Day 3

echo "🔍 Verification Checklist:"
echo ""

# 1. Supabase
echo "1. Supabase Schema:"
supabase db diff && echo "✅ Schema up-to-date" || echo "❌ Schema needs update"

# 2. Knowledge Base
echo "2. Knowledge Base:"
psql $DATABASE_URL -c "SELECT COUNT(*) as total_items FROM project_knowledge;" || echo "❌ Connection failed"

# 3. Docker Stack
echo "3. Docker Stack:"
ssh administrator@your-vps-ip "cd /opt/wallesters-stack && docker-compose ps" || echo "❌ VPS unreachable"

# 4. n8n Workflows
echo "4. n8n Workflows:"
curl -s -H "X-N8N-API-KEY: $N8N_API_KEY" https://n8n.your-domain.com/api/v1/workflows | jq '.data | length' || echo "❌ n8n API error"

# 5. ContextStream
echo "5. ContextStream:"
ps aux | grep -q contextstream && echo "✅ Running" || echo "❌ Not running"

# 6. Vector Search Test
echo "6. Vector Search:"
node automation_scripts/test-vector-search.mjs && echo "✅ Working" || echo "❌ Failed"

echo ""
echo "Checklist complete! Fix any ❌ items before proceeding."
```

---

## 📊 FINAL TIMELINE SUMMARY

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| **Security Audit** | 30 min | Rotated credentials, . gitignore updated |
| **Foundation** | 4h | Codespace, Supabase, Docker stack, bulk import |
| **AI & Workflows** | 3h | n8n workflows, ContextStream, RAG agent |
| **Testing** | 2h | End-to-end tests, monitoring setup |
| **Documentation** | 2h | PROJECT_CONTEXT auto-update, team guides |
| **Total** | **11.5 hours** | **Full system operational** |

---

## 💰 FINAL COST BREAKDOWN

| Item | Cost | Frequency |
|------|------|-----------|
| **One-Time Setup** | | |
| - Bulk import (OpenAI) | $5 | Once |
| **Monthly Operational** | | |
| - OpenAI API (embeddings) | $50-80 | Monthly |
| - Claude API (reasoning) | $30-50 | Monthly |
| - Supabase | $0-25 | Monthly |
| - Hostinger VPS KVM2 | $20 | Monthly |
| - GitHub Enterprise | $0 | Included |
| - ContextStream local | $0 | Free |
| **Total First Month** | **$105-180** | |
| **Total Ongoing** | **$100-175/month** | |

---

## 🎯 NEXT STEPS AFTER COMPLETION

### **Week 2: Optimization**
1. ✅ Fine-tune chunking strategies (test RAGFlow vs simple splitter)
2. ✅ Add more specialized vector stores (code vs docs vs workflows)
3. ✅ Implement session correlation (aggregate insights from multiple AI sessions)

### **Week 3: Advanced Features**
1. ✅ GitHub Sparks prototypes (monitoring dashboards, admin panels)
2. ✅ Multi-AI agent task dispatcher
3. ✅ Predictive context pre-loading

### **Week 4: Scale & Polish**
1. ✅ Performance tuning (if > 100K documents)
2. ✅ Security hardening (penetration testing)
3. ✅ Team training & documentation

---

## 🚀 ГОТОВ ЗА СТАРТИРАНЕ

**Започнете СЕГА с:**

```bash
# Step 1: Security audit (DO THIS FIRST!)
git clone https://github.com/Wallesters-org/wallesters.org
cd wallesters.org
brew install gitleaks
gitleaks detect --no-git --verbose

# Step 2: Rotate any exposed credentials
# Step 3: Continue with Phase 1... 
```

---

🎉 **Имате всичко необходимо за успешно изпълнение!   Успех!  **