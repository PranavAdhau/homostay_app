# Restore

Restore helpers:
- `bash scripts/restore/postgres-restore.sh path/to/postgres.sql.gz`
- `bash scripts/restore/storage-restore.sh path/to/storage.tar.gz`
- `bash scripts/restore/config-restore-checklist.sh`
- `bash scripts/restore/manual-restore-verify.sh`

Manual restore verification is implemented now and is designed to be reusable by future CI smoke tests.
