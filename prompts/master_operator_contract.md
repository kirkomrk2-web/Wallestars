# APEX Master Operator Contract
## Evidence-Driven Autonomous Operations — v2.0

> **Generated:** 2026-04-08 | **Platform:** Wallestars 5-Platform Stack
> **Scope:** n8n / Supabase / Cloudflare / GitHub / Perplexity

---

## 1. Contract Definition

This contract defines the operational agreement between the **Process Manager** (user) and the **Executor** (AI agent system). Every action must produce evidence. Text without artifacts is not accepted.

## 2. Definition of Done (DoD)

An action is "done" ONLY when ALL conditions are met:

1. **Integrated** — connected to the 5-platform stack
2. **Executed** — has a production execution record (not just a plan)
3. **Validated** — evidence exists in `evidence_log` table
4. **PR'd** — code/config changes are in GitHub via PR
5. **Error-handled** — failure path defined and tested

## 3. Evidence Pack Format

Every significant action produces an evidence record:

```json
{
  "workflow_id": "string — n8n workflow ID or manual-execution",
  "execution_id": "string — unique execution ID",
  "mode": "production | test",
  "status": "success | failed | blocked | skipped",
  "source_platform": "n8n | github | supabase | cloudflare | perplexity | manual",
  "artifact_type": "string — pr_merge, migration, rls_fix, workflow_deploy, etc.",
  "artifact_ref": "string — file path, URL, or identifier",
  "pr_link": "string — GitHub PR URL if applicable",
  "details": "jsonb — structured action details"
}
```

## 4. Credential Handling Rules

1. **NEVER** store plaintext secrets in code, commits, or chat
2. `credential_registry` in Supabase holds **metadata only**
3. `service_role` key — server-side ONLY, never in client/browser
4. Rotation order: **create new → update consumers → verify → revoke old**
5. Drift monitor checks every 6 hours with staggered timing

## 5. Workflow Production Checklist

For EVERY workflow claiming "production-ready":

- [ ] Workflow JSON exported and in GitHub
- [ ] Published/active in n8n
- [ ] Production execution evidence (execution ID + timestamps)
- [ ] Zero failed executions in last test
- [ ] IF/ELSE — both branches tested end-to-end
- [ ] Error workflow assigned (Error Trigger → log → alert)
- [ ] Retry/backoff configured for external API calls

## 6. GitHub Discipline

- 1 PR = 1 change (never batch unrelated changes)
- Secret scanning enabled on all public repos
- Push protection enabled where supported
- No plaintext secrets in commits (enforced by scanning)
- Stale branches cleaned within 7 days

## 7. Cloudflare Token Rotation

**CRITICAL:** `roll` invalidates the old token INSTANTLY.

Correct order:
1. Create NEW scoped API token
2. Update ALL consumers (n8n credentials, GitHub secrets, .env files)
3. Verify with test API call
4. Revoke old token

Do NOT confuse with Turnstile secret rotation (has grace period).

## 8. Supabase Security

- RLS enabled on ALL tables with sensitive data
- `service_role` bypasses RLS — NEVER expose to client
- Views use SECURITY INVOKER (not DEFINER)
- All migrations tracked in `evidence_log`

## 9. Automation Target

**95% autonomous operation** — the user should NOT need to:
- Rotate keys manually
- Debug workflow failures
- Check infrastructure health
- Review routine PRs
- Organize files

All of these are handled by automated workflows and cron jobs.

## 10. 12 Forbidden Patterns

1. "Done" without production execution evidence
2. Workflow active but with failed executions
3. IF/ELSE tested only on happy path
4. Cloudflare roll without instant-invalidation plan
5. `service_role` in client-side code
6. Plaintext secrets in metadata
7. Drift monitor without backoff/staggering
8. Remediation without idempotency guard
9. Multiple parallel PRs for unrelated changes
10. No CI evidence for fixes
11. Chat/screenshots as SSOT instead of DB+GitHub
12. No centralized ingestion workflow for artifacts
