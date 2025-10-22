# Database Migrations

This directory contains SQL migration scripts for the CRM database.

## How to Apply Migrations

Since this project doesn't have sequelize-cli configured yet, migrations are applied manually using psql.

### Apply Migration

```bash
# Connect to your database and run the migration
psql -d agentiq -f migrations/20251022-add-score-calculated-at.sql
```

### Rollback Migration

To rollback, execute the DOWN MIGRATION section from the SQL file:

```bash
psql -d agentiq -c "DROP INDEX IF EXISTS idx_leads_score_calculated_at;"
psql -d agentiq -c "ALTER TABLE leads DROP COLUMN score_calculated_at;"
```

## Current Migrations

1. **20251022-add-score-calculated-at.sql**
   - Adds `score_calculated_at` timestamp field to `leads` table
   - Updates existing leads with activity scores to have current timestamp
   - Creates index for query performance
