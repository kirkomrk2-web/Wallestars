# File Type Strategy — APEX Framework

## Принцип

Всеки файл в системата трябва да има:
1. **Един каноничен дом** — не се дублира
2. **Версионен контрол** — git за код/конфиг, Supabase timestamps за данни
3. **Автоматичен routing** — APEX-00 класифицира и насочва

## Таблица: Файлов тип → Дестинация

| Тип файл | Canonical Home | Версиониране | Backup |
|----------|---------------|-------------|--------|
| n8n workflow (.json) | n8n instance + GitHub `n8n-workflows/` | Git commits | n8n export |
| SQL migration (.sql) | Supabase migrations | `apply_migration` API | Git `supabase/` |
| AI prompt (.md) | GitHub `prompts/` | Git commits | N/A |
| Schema (.json) | GitHub `schemas/` | Git commits | N/A |
| Documentation (.md) | GitHub `docs/` | Git commits | N/A |
| Credential metadata | Supabase `credential_registry` | `updated_at` column | N/A |
| Evidence records | Supabase `evidence_log` | `timestamp` column | N/A |
| Phone inventory | Supabase `duoplus_fleet.phones` | `updated_at` | CSV export |
| Audio/Media | iCloud `06_Media/` | iCloud versioning | N/A |
| Sensitive files | iCloud `07_Sensitive/` | iCloud versioning | KeePassXC |

## Правило за стари версии

- **Git файлове**: `git log` показва цялата история. Не пази стари копия.
- **Supabase данни**: `updated_at` timestamps. Няма нужда от отделни backups.
- **n8n workflows**: Export JSON при промяна → commit в GitHub.
- **iCloud**: Автоматично версиониране. Не създавай `_v2`, `_old`, `_backup` файлове.

## Anti-Patterns (забранени)

- ❌ `файл_v2_FINAL_FINAL.json`
- ❌ Дублиране между iCloud и Google Drive
- ❌ Скрийншоти като SSOT вместо DB записи
- ❌ ZIP файлове в repos (разпакетирай и commit source файлове)
- ❌ Ръчно копиране между устройства (използвай git/iCloud sync)
