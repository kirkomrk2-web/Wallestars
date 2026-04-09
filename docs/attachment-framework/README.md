# APEX Attachment Analysis Framework

> Automated Processing & Evidence eXecution — v2.0

## Overview

APEX е production-grade framework за автоматизирана обработка, класификация и routing на артефакти в 5-платформения Wallestars стек. Всяко действие произвежда evidence record в Supabase.

## Architecture

```
                    ┌─────────────────────┐
                    │   APEX-00 Intake     │
                    │   Router (Webhook)   │
                    └────────┬────────────┘
                             │
                    ┌────────▼────────────┐
                    │   Classify Artifact  │
                    │   (file type/source) │
                    └────────┬────────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐
        │ Workflow  │  │ Document │  │  Script  │
        │ → n8n    │  │ → GitHub │  │ → Exec   │
        └────┬─────┘  └────┬─────┘  └────┬─────┘
             │              │              │
             └──────────────┼──────────────┘
                            ▼
                   ┌─────────────────┐
                   │ APEX-01 Evidence │
                   │ Logger → Supabase│
                   └─────────────────┘
```

## Workflows

| ID | Name | Trigger | Purpose |
|----|------|---------|---------|
| APEX-00 | Intake Router | Webhook POST | Classify + route incoming artifacts |
| APEX-01 | Evidence Logger | Webhook POST | Log evidence to Supabase + Telegram alert |
| APEX-02 | Credential Drift Monitor | Schedule (6h) | Validate credentials, alert on drift |
| APEX-03 | Global Error Handler | Error Trigger | Catch workflow failures → log + alert |

## File Types & FARE Routes

| Extension | Artifact Type | FARE Destination |
|-----------|--------------|------------------|
| .json | workflow | n8n-workflows/ |
| .md | document | docs/ |
| .sql | migration | supabase/migrations/ |
| .py, .sh | script | scripts/ |
| .csv | data | 03_Reference/ |
| .png, .jpg | screenshot | 06_Media/screenshots/ |
| .mp3, .m4a | audio | 06_Media/audio/ |

## Evidence Pack Schema

See `schemas/unified_context.schema.json` for the full JSON Schema.
See `schemas/evidence_pack.example.json` for a real example from 2026-04-08.

## Setup

1. Import all APEX-*.json workflows into n8n
2. Configure Supabase credentials (Wallestars project)
3. Configure Telegram Bot credentials (@zarcheto6_bot)
4. Set APEX-03 as Error Workflow for APEX-00, APEX-01, APEX-02
5. Activate all workflows

## Security

- No plaintext secrets in any file
- `service_role` key NEVER in client-side
- All tables have RLS enabled
- Credential registry stores metadata only
