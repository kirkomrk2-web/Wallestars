# APEX Implementation Plan

## Phase 1: Foundation (Done — 2026-04-08)

- [x] `evidence_log` table created in Supabase with RLS
- [x] `credential_registry` table created with 10 entries
- [x] 14 SECURITY DEFINER views → SECURITY INVOKER
- [x] Secret scanning enabled on all public repos
- [x] 6 Perplexity cron jobs active (drift monitor, health, GitHub)
- [x] All credentials rotated and validated
- [x] DuoPlus 500-phone inventory complete

## Phase 2: Workflow Deployment (Pending n8n import)

- [ ] Import APEX-00 through APEX-03 into n8n
- [ ] Configure credential bindings (Supabase, Telegram, GitHub)
- [ ] Set APEX-03 as error workflow for all others
- [ ] Activate and run E2E tests
- [ ] Record first production execution evidence

## Phase 3: Full Automation (Target: 95% autonomous)

- [ ] Automated PR audit on every push (n8n → GitHub webhook)
- [ ] Automated credential rotation on expiry warning
- [ ] Automated file ingestion via Apple Shortcuts → APEX-00 webhook
- [ ] Self-healing: drift detection → auto-remediation → verify → notify
- [ ] Cross-platform health dashboard in Supabase

## Phase 4: Scale

- [ ] DuoPlus phone farm orchestration (500 phones)
- [ ] Multi-agent coordination via n8n + Perplexity crons
- [ ] Knowledge base ingestion from all AI chat sessions
- [ ] Automated financial tracking (subscriptions, costs, ROI)
