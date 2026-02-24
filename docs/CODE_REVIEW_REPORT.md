# Automated Code Review Report — Feature Test #2

**Date:** 2026-02-24
**Reviewer:** Claude Sonnet 4.6 (Automated)
**Scope:** Full codebase — `src/`, `server/`, config files
**Status:** ✅ All Critical & High issues fixed

---

## Summary

| Severity | Found | Fixed |
|----------|-------|-------|
| Critical | 6     | 6     |
| High     | 3     | 3     |
| Medium   | 5     | 0 (documented) |
| Low      | 2     | 0 (documented) |

---

## 🔴 CRITICAL Issues (Fixed)

### C1 — Hardcoded GitHub PAT in `.mcp.json`
- **File:** `.mcp.json:45`
- **Description:** Live GitHub Personal Access Token `github_pat_11B3ZLWAY0pNg2xHP0DrGB_x36FYWTwEwrLsCtAS9naoKqxnS` was hardcoded and committed to version control.
- **Risk:** Full repository and organization access for anyone with repo access.
- **Fix applied:** Replaced with `${GITHUB_PERSONAL_ACCESS_TOKEN}` env var reference.
- **Action required:** **Revoke this token immediately on GitHub → Settings → Developer settings → Personal access tokens.**

### C2 — Hardcoded Supabase Service Role Key in `.mcp.json`
- **File:** `.mcp.json:57`
- **Description:** Live Supabase service role JWT (project `ansiaiuaygcfztabtknl`) hardcoded in source.
- **Risk:** Unrestricted database read/write/delete access, bypasses Row Level Security.
- **Fix applied:** Replaced with `${SUPABASE_SERVICE_ROLE_KEY}` env var reference.
- **Action required:** **Regenerate this key in Supabase Dashboard → Project Settings → API.**

### C3 — Hardcoded Netlify Auth Token in `.mcp.json`
- **File:** `.mcp.json:67`
- **Description:** Live Netlify auth token `nfp_CKTVyZWz1dDqcdrM2QMveEEN8DmqHnt2e23c` hardcoded in source.
- **Risk:** Full deployment and site configuration control for the Netlify account.
- **Fix applied:** Replaced with `${NETLIFY_AUTH_TOKEN}` env var reference.
- **Action required:** **Revoke this token in Netlify → User settings → Applications → Personal access tokens.**

### C4 — Command Injection in `/api/computer/click`, `/type`, `/key`, `/execute`
- **File:** `server/routes/computerUse.js:35,58,79,139`
- **Description:** User-controlled `x`, `y`, `button`, `text`, and `key` values were interpolated directly into shell commands via `execAsync`. The `/execute` whitelist only checked the first word — `ls $(id)` would pass the `ls` whitelist while executing arbitrary code.
- **Risk:** Remote code execution with server process privileges.
- **Fix applied:**
  - `/click`: `parseInt` validation; `button` restricted to `[1,2,3]`.
  - `/type`: Added `typeof` guard.
  - `/key`: Whitelist regex `/^[a-zA-Z0-9+_\-]+$/` for valid xdotool key names.
  - `/execute`: Shell metacharacter rejection regex `/[&|;`$(){}[\]<>\\]/` before whitelist check.

### C5 — Command Injection in ADB routes (`/api/android/*`)
- **File:** `server/routes/android.js:42,73,97,120,142`
- **Description:** `deviceId`, `x`, `y`, `keyCode`, `text`, and `apkPath` from request body were interpolated directly into `adb` shell commands without sanitization.
- **Risk:** Remote code execution; attacker could pass `deviceId = "foo; rm -rf /"`.
- **Fix applied:**
  - Added `validateDeviceId()` helper — `/^[\w.:_-]+$/` regex on all `deviceId` inputs.
  - Parsed `x`, `y` as `parseInt`; validated `keyCode ≥ 0`.
  - Escaped `"$\` in `text` before double-quoted shell injection.
  - Rejected shell metacharacters and `..` in `apkPath`.

### C6 — Shell Metacharacter Bypass in `/execute` Whitelist
- **File:** `server/routes/computerUse.js:130`
- **Description:** `command.split(' ')[0]` only extracted the first space-separated token. `"ls $(id)"` splits to `["ls","$(id)"]` — `ls` passes the whitelist, but `$(id)` still executes.
- **Risk:** Shell command injection via command substitution.
- **Fix applied:** Added pre-whitelist metacharacter regex check; changed split to `/\s+/`.

---

## 🟠 HIGH Issues (Fixed)

### H1 — CORS Wildcard `origin: '*'` in Production
- **File:** `server/index.js:49`
- **Description:** Express CORS middleware was set to `origin: '*'` unconditionally, allowing any website to make credentialed cross-origin requests to all API endpoints including sensitive ones (Twilio SMS, OpenAI, Wallester).
- **Fix applied:** CORS origin now resolves to `process.env.FRONTEND_URL || process.env.ALLOWED_ORIGIN || false` in production; `'*'` retained only in development.

### H2 — Unbounded Socket Stream Interval (DoS Risk)
- **File:** `server/socket/handlers.js:10`
- **Description:** A WebSocket client could set `interval=1` to trigger a screenshot every millisecond, exhausting CPU and memory.
- **Fix applied:** Interval clamped to `[500ms, 30000ms]` for screen streams; `[1000ms, 60000ms]` for metrics streams.

### H3 — PII (Full Names) Written to Server Logs
- **File:** `server/routes/wallester.js:43`
- **Description:** Full first/middle/last names of eligibility check subjects were logged to stdout (`console.log`), creating a GDPR/data-privacy risk in server logs.
- **Fix applied:** Replaced with `"Checking eligibility for user (names redacted)"`.

---

## 🟡 MEDIUM Issues (Documented, Not Auto-Fixed)

### M1 — In-Memory State for N8N Webhook Data
- **File:** `server/routes/n8nWebhooks.js:6-10`
- **Description:** `healthReports`, `githubEvents`, `agentActivity`, `alerts` stored in module-level arrays. Data lost on every restart; unbounded growth if `shift()` limit is hit under high load.
- **Suggestion:** Replace with a persistent store (Redis, SQLite, or Supabase).

### M2 — No Input Size Limits on Claude Chat
- **File:** `server/routes/claude.js:13`
- **Description:** `message` and `conversationHistory` accept unlimited payload sizes. A single request could send megabytes of tokens, triggering large API bills.
- **Suggestion:** Add `express-rate-limit` middleware and enforce max payload size via `express.json({ limit: '100kb' })`.

### M3 — No Rate Limiting on External API Proxy Routes
- **File:** `server/routes/openai.js`, `server/routes/twilio.js`, `server/routes/sendgrid.js`
- **Description:** All proxy routes are publicly accessible without authentication or rate limits. Abuse could result in large bills.
- **Suggestion:** Add per-IP rate limiting and/or bearer token auth for server-side routes.

### M4 — Error Messages Leak Internal Details
- **File:** Multiple route handlers (all `error.message` returns)
- **Description:** Raw `error.message` from internal libraries returned to HTTP clients — may expose file paths, stack traces, or library internals.
- **Suggestion:** Map internal errors to generic messages; only include `error.message` in development.

### M5 — Mock Implementation in Production Path
- **File:** `server/routes/wallester.js:87-92`
- **Description:** Eligibility checks silently fall back to deterministic mock data when the Trade Register API is unavailable. Production users receive fake eligibility results.
- **Suggestion:** Return a clear 503 error when the real API is unavailable instead of serving mock data.

---

## 🔵 LOW Issues (Documented)

### L1 — Deprecated `claude-sonnet-4-5-20250929` Model ID
- **File:** `server/routes/claude.js:20,66,115`
- **Description:** Hardcoded model ID may become unavailable; the capabilities endpoint also references `claude-opus-4-5-20251101` which does not match current model naming.
- **Suggestion:** Read model ID from `process.env.CLAUDE_MODEL` with a sensible default.

### L2 — `global.io` Antipattern
- **File:** `server/index.js:116`
- **Description:** `global.io = io` pollutes the Node.js global namespace, making the dependency implicit and untestable.
- **Suggestion:** Pass `io` explicitly via dependency injection into the n8n webhooks router.

---

## Files Modified

| File | Changes |
|------|---------|
| `.mcp.json` | Removed 3 hardcoded credentials (C1, C2, C3) |
| `server/routes/computerUse.js` | Input validation for click/type/key; metachar guard for execute (C4, C6) |
| `server/routes/android.js` | `validateDeviceId()` + int parsing + text escaping across all 6 endpoints (C5) |
| `server/index.js` | Production CORS restricted to `FRONTEND_URL`/`ALLOWED_ORIGIN` (H1) |
| `server/socket/handlers.js` | Screen stream interval clamped 500ms–30s; metrics interval clamped 1s–60s (H2) |
| `server/routes/wallester.js` | Full name removed from log output (H3) |

---

## Required Manual Actions

> These cannot be automated safely. They must be done by the repository owner.

1. **Rotate all 3 exposed credentials** (GitHub PAT, Supabase Service Role Key, Netlify Auth Token) — treat them as compromised.
2. **Untrack `.mcp.json` from git:** run `git rm --cached .mcp.json` — it is already in `.gitignore` but still tracked.
3. **Purge secrets from git history** using [BFG Repo Cleaner](https://rtyley.github.io/bfg-repo-cleaner/) or `git filter-branch` to prevent leaked history.
4. **Set environment variables** `FRONTEND_URL` or `ALLOWED_ORIGIN` in production to enable proper CORS restriction (H1 fix requires this env var).
