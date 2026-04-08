# Apple Shortcuts → APEX Control Plane Mapping

## Концепция

Apple Shortcuts на iPhone служат като **control plane** за APEX framework:
- Бърз capture от телефона → webhook → n8n → Supabase
- Няма нужда от ръчно отваряне на n8n или GitHub

## Shortcuts Inventory

### 1. Drop to Inbox
- **Trigger:** Share Sheet / Quick Action
- **Action:** POST файл/текст към APEX-00 Intake Router webhook
- **FARE Route:** `01_Inbox/` (за триаж)
- **n8n Webhook:** `https://n8n.srv1201204.hstgr.cloud/webhook/apex-intake`

### 2. Quick Evidence
- **Trigger:** Widget / Home Screen
- **Action:** Capture screenshot + description → POST към APEX-01 Evidence Logger
- **Data:** `{ source: "iphone", artifactType: "screenshot", description: "..." }`

### 3. Credential Alert
- **Trigger:** Automation (when receiving Telegram notification)
- **Action:** Parse drift alert → open KeePassXC → show affected credential

### 4. Health Check
- **Trigger:** Widget tap
- **Action:** GET status endpoints → display traffic light
- **Endpoints:**
  - openclaw-hub: `https://openclaw-hub-production-0484.up.railway.app`
  - KVM8: `http://147.93.57.132:63248`
  - Supabase: `https://ansiaiuaygcfztabtknl.supabase.co/rest/v1/`

## Toolbox Pro Integration

Toolbox Pro разширява Shortcuts с:
- **Global Variables** — store n8n webhook URLs, API endpoints
- **Rich Notifications** — formatted alerts from APEX
- **Image OCR** — extract text from screenshots before sending to APEX
- **JSON Parsing** — parse APEX responses inline

## Setup

1. Install Toolbox Pro from App Store
2. Create Global Variable: `APEX_WEBHOOK = https://n8n.srv1201204.hstgr.cloud/webhook/apex-intake`
3. Import Shortcuts from iCloud link (to be generated)
4. Grant Shortcuts → Photos, Files, Notifications permissions
