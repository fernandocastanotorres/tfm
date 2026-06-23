# Database Seed Data

Seed data for initializing a fresh PostgreSQL database with the TFG Records system.

## Usage

The seed data loads **automatically** on first start when the postgres data volume is empty:

```bash
# Start fresh (deletes existing data!)
docker compose down -v
docker compose up -d
```

## What's included

| File | Purpose |
|---|---|
| `01_data.sql` | All table data (Flowable BPMN deployments, catalogs, users, etc.) |
| `zz_schema_reference.sql` | Schema-only dump (reference, not executed on init) |

## Regenerate seed data

When you modify data and want to update the seed:

```bash
# 1. Ensure the database has the data you want to seed
# 2. Dump data only (schema already created by migrations)

docker exec tfm-postgres bash -c \
  "PGPASSWORD=\$POSTGRES_PASSWORD pg_dump -U \$POSTGRES_USER \
   -d \$POSTGRES_DB --data-only --column-inserts --disable-triggers" \
  > backend/db/postgresql/seed/01_data.sql

# 3. Commit the new seed
git add backend/db/postgresql/seed/01_data.sql
git commit -m "chore: update database seed"
```

For schema-only reference:
```bash
docker exec tfm-postgres bash -c \
  "PGPASSWORD=\$POSTGRES_PASSWORD pg_dump -U \$POSTGRES_USER \
   -d \$POSTGRES_DB --schema-only" \
  > backend/db/postgresql/seed/zz_schema_reference.sql
```

## Notes

- Data is dumped with `--column-inserts` for clean diffs
- Binary data (BPMN XML) uses `\x` hex encoding
- Flowable tables have circular FKs — `pg_dump` warnings are expected, data restores correctly
- The seed does NOT include: `document_registry_counters` (counter resets on fresh start), audit logs, uploaded documents
