# 🚀 Deployment Instructions: Wallester Automation V3

## 1. Supabase Database Setup (Action Required)

Since the local environment does not have direct administrative access to your remote Supabase instance for schema migrations, you must run the SQL manually.

**SQL File**: `supabase/migrations/004_create_registration_progress.sql`

### Instructions:
1.  Go to your **Supabase Dashboard** -> **SQL Editor**.
2.  Create a **New Query**.
3.  Copy the **entire content** of `supabase/migrations/004_create_registration_progress.sql`.
4.  Paste it into the editor and clicking **Run**.
5.  **Verify**: creating a new row in `registration_progress` or checking if the table exists in the Table Editor.

---

## 2. N8N Workflow Configuration (completed)

Antigravity has successfully imported the following workflows to your n8n instance (`https://n8n.srv1201204.hstgr.cloud`):

| Workflow Name | Status | ID |
|:---|:---|:---|
| **DuoPlus SMS Worker (Improved)** | ✅ Imported | `54uBtPRt9MXapGSU` |
| **Email OTP Extractor** | ✅ Imported | `mt9a1TGUHPi6AMQl` |
| **Wallester Registration Agent V3** | ✅ Imported | `QIA2oaQeC5kNVYCR` |

### Required Configuration Steps in N8N:
1.  Open the **Wallester Registration Agent V3** workflow.
2.  **Activate** the workflow (toggle top right).
3.  **Check Credentials**:
    *   Ensure the `Supabase` nodes have the correct credential selected.
    *   Ensure `Airtop` and `Slack` nodes have the correct credential selected.
    *   Verify the `Execute Workflow` nodes point to the correct sub-workflow IDs (they should auto-link by ID if names match, but verify).
4.  **Webhooks**:
    *   Note the Production Webhook URL for the triggering node.

---

## 3. Final Verification

1.  Trigger the workflow sending a test payload to the webhook.
2.  Monitor the `registration_progress` table in Supabase.
3.  Check Slack for notifications.
