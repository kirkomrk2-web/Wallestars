# 🚀 Final Wallestars n8n Setup Instructions

I have created the workflows and configured the backend files. To finish the setup, please perform these manual steps in n8n.

## 1. Create Credentials in n8n
Go to: **[n8n Credentials](https://n8n.srv1201204.hstgr.cloud/home/credentials)**

Create new credentials for each service using the keys below:

### A. Supabase Wallestars
- **Type:** Supabase API
- **Host:** `https://ansiaiuaygcfztabtknl.supabase.co`
- **Service Role Key:**
  ```text
  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFuc2lhaXVheWdjZnp0YWJ0a25sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzA2ODY2OSwiZXhwIjoyMDc4NjQ0NjY5fQ.uAy4O9560idXOE6kAudCGYwC3K5ypPngZsbe7e3tWBA
  ```
  *(If that fails, try the NEW secret key: `sb_secret_kjQ3IpbEdaTKBaWUgO6aFg_hEJ26Jux`)*

### B. Anthropic Claude
- **Type:** Anthropic API
- **API Key:**
  ```text
  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
  ```

### C. Airtop API Key (Already Created!)
- **Type:** Header Auth
- **Name:** `Authorization`
- **Value:** `Bearer 73f2c358fd0fc2e4.HthdT2bIs4f14zmFQu2pM0jMBXBtXyiV4wmi8vY52x`

### D. Slack Wallestars
- You are logged into the workspace!
- To get the token:
  1. Go to **[https://api.slack.com/apps](https://api.slack.com/apps)**
  2. Click **Create New App** -> **From scratch**.
  3. Name: "Wallestars Bot", Workspace: "Your New Workspace".
  4. Go to **OAuth & Permissions**.
  5. Add Bot Scope: `chat:write`.
  6. **Install to Workspace**.
  7. Copy the **Bot Token** (`REDACTED-...`).
  8. Create a **Slack API** credential in n8n with this token.


---

## 2. Link Credentials to Workflows
Go to: **[n8n Workflows](https://n8n.srv1201204.hstgr.cloud/home/workflows)**

1. Open **"Wallester Registration Agent (Supabase + Airtop + MCP)"**
2. Click on the nodes with ⚠️ warnings (Supabase, Claude, etc.)
3. Select the matching credential you just created.
4. **Save** and **Activate** the workflow.

---

## 3. Test Connection
Once credentials are saved:
1. Open the "Wallester Registration Agent" workflow.
2. Click **"Test Step"** on the `Supabase` node to verify it can read from your database.
3. If successful, the entire pipeline is ready!

## 4. MCP Configuration
I have updated your `.mcp.json` file with the Supabase MCP server:
```json
"supabase": {
  "url": "https://mcp.supabase.com/mcp?project_ref=ansiaiuaygcfztabtknl",
  "transport": "sse"
}
```
This enables the MCP Client node in n8n (if configured to read this file or if you add it manually as an MCP server in the n8n UI).
