# 🌌 Wallestars Ultimate Dynamic View Roadmap
### Global Process Visualization & Orchestration Map

> **Current State**: `ACTIVE DEVELOPMENT`
> **Lead Orchestrator**: Antigravity (Google DeepMind)
> **Infrastructure**: Distributed (Local + Cloud VPS)

---

## 🏗️ 1. Global Infrastructure & Ecosystem

### ☁️ Cloud & Compute
| Platform | Role | Credential Ref | Status |
|----------|------|----------------|--------|
| **Hostinger VPS** | Primary Host (Ubuntu 24.04) | `srv1201204.hstgr.cloud` (IP: `72.61.154.188`) | 🟢 **Online** |
| **Docker** | Container Orchestration | `n8n`, `nginx`, `postgres` | 🟢 **Running** |
| **Nginx** | Reverse Proxy & SSL | `workmail.pro`, `n8n.srv1201204...` | 🟢 **Active** |
| **Local Machine** | Dev Environment | `/home/administrator/Documents/Projects/Wallestars` | 🟢 **Connected** |

### 🗄️ Data & Backend
| Platform | Role | Resource | Status |
|----------|------|----------|--------|
| **Supabase** | Primary Database (PostgreSQL) | `registration_progress`, `verified_business_profiles` | 🟢 **Connected** |
| **PostgreSQL** | Local/VPS Database | `postgres` service on VPS | 🟡 **Standby** |
| **Storage** | Artifact & Log Storage | Supabase Storage buckets | 🟢 **Active** |

### 🤖 AI & Agents
| Agent | Role | Scope | Status |
|-------|------|-------|--------|
| **Antigravity** | **Lead Architect** | Global Strategy, Validation, Orchestration | 🟢 **Active** |
| **Claude (Web)** | Coding Assistant | Code Generation, Bug Fixing | 🟢 **Active** |
| **GitHub Copilot** | Dev Assistant | Inline Code Completion, PR Reviews | 🟢 **Active** |
| **Gemini** | Intelligence | Data Analysis, Dynamic Views (Emulated) | 🟢 **Active** |

### 🛠️ Tools & DevOps
| Tool | Role | Details | Status |
|------|------|---------|--------|
| **GitHub** | Version Control | `Wallesters-org/Wallestars` | 🟢 **Synced** |
| **GitKraken** | GUI Git Client | Branch Management, Visual History | 🟢 **Active** |
| **Postman** | API Testing | Collections for N8N Webhooks | 🟢 **Active** |
| **Airtop** | Browser Automation | Headless Sessions for Web Interaction | 🟢 **Integrated** |
| **DuoPlus** | SMS Provider | Real US/UK numbers for OTP | 🟢 **Integrated** |

---

## 🚀 2. Active Projects & Workflows

### 🅰️ **Project: Wallester Automation (Core)**
**Goal**: Fully automated registration of business accounts on Wallester.com.

#### **Workflow Architecture (N8N)**
*   **Main Brain**: `wallester-registration-agent-v3.json`
    *   *Role*: Decisions, Flow Control, Error Handling.
*   **Worker: SMS**: `duoplus-sms-worker-improved.json`
    *   *Input*: `{ country, service }` -> *Output*: `{ otp_code }`
    *   *Status*: **COMPLETED** (Supports 7 regex patterns, 12 retries).
*   **Worker: Email**: `email-otp-extractor.json`
    *   *Input*: `{ filter, subject }` -> *Output*: `{ otp_code, link }`
    *   *Status*: **COMPLETED** (Gmail integration, 10 retries).
*   **Registry**: `registry-local-worker.json`
    *   *Role*: Fetch real company data for registration.

#### **Data Layer (Supabase)**
*   **Table**: `registration_progress` (Tracks 18 discrete steps).
*   **Functions**: `update_registration_step()`, `log_registration_error()`.

---

### 🅱️ **Project: Telegram Intelligence Agent (New)**
**Goal**: Turn "Saved Messages" into an actionable knowledge base.

#### **Proposed Workflow**
1.  **Ingestion**: N8N Telegram Trigger (watches `Saved Messages`).
2.  **Analysis**: AI Agent (Claude/Gemini/OpenAI node) analyzes text/link/image.
3.  **Categorization**:
    *   `🔴 URGENT`: Immediate action required.
    *   `🟡 PROJECT`: Relates to Wallestars or active dev.
    *   `🔵 REFERENCE`: Docs, cool tools, ideas.
    *   `⚪ PERSONAL`: Non-work items.
4.  **Action**:
    *   If `PROJECT` -> Create GitHub Issue or Update `TASKS` file.
    *   If `REFERENCE` -> Store in `KNOWLEDGE_BASE.md`.
    *   If `URGENT` -> Send push notification / High priority alert.

---

## 📂 3. File System & Directory Map
**Root**: `/home/administrator/Documents/Projects/Wallestars`

*   `📂 .github`
    *   `📂 workflows` (CI/CD Automations)
    *   `📂 TASKS` (Project Management, Agent Instructions)
*   `📂 n8n-workflows` (The Brains)
    *   `📄 wallester-registration-agent-v3.json` (MASTER)
    *   `📄 duoplus-sms-worker-improved.json` (SMS)
    *   `📄 email-otp-extractor.json` (EMAIL)
*   `📂 src` (Frontend/Web Dashboard code)
*   `📂 supabase`
    *   `📂 migrations` (Database Schema Definitions)
*   `📂 get-shit-done` (Utilities & Scripts)

---

## ⏳ 4. Immediate Roadmap (Next 48 Hours)

1.  **Integration Testing**:
    *   Connect `v3` agent with `duoplus` & `email` workers in live N8N environment.
    *   **Action**: Deploy updated JSONs to VPS.
2.  **Supabase Deploy**:
    *   Run `004_create_registration_progress.sql` migration.
3.  **Telegram Agent Setup**:
    *   Create new N8N workflow: `telegram-saved-messages-sorter.json`.
    *   Connect Telegram API credentials.

---

## 🔗 Credentials & Access Map
*(High-Level View - Secrets Hidden)*

*   **Hostinger**: API Key `wEMU...` -> DNS & Server Mgmt.
*   **Supabase**: Key `sb_secret...` -> Database R/W.
*   **GitHub**: Token `ghp_...` -> Repo actions.
*   **Azure**: Dev Ops integration.
*   **Anthropic**: API Key `sk-ant...` -> Intelligence provider for N8N nodes.

---

> **Dynamic View Status**: All systems indexed. ready for interaction using `https://gemini.google.com/app`. 
> Use the link below to visualize this data dynamically if supported, otherwise refer to this live document as the master truth.
