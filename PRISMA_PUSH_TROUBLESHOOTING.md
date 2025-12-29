# Prisma Schema Push Troubleshooting

## Common Issues & Solutions

### 1. **Connection Pooling Timeout**

**Problem:** Connection pooling (port 6543) can sometimes timeout during schema operations.

**Solution:** Temporarily use direct connection for schema push:

1. In Supabase Dashboard → Settings → Database
2. Get the **Direct Connection** URL (port 5432)
3. Temporarily update `.env.local`:
   ```bash
   DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres?sslmode=require"
   ```
4. Run: `npx prisma db push`
5. Switch back to connection pooling URL after push completes

**Note:** Direct connection requires IPv6. If you're on IPv4-only network, you'll need to use a VPN or different network.

---

### 2. **Connection Timeout**

**Problem:** Default timeout is too short for slow connections.

**Solution:** Add timeout parameters to connection string:

```bash
DATABASE_URL="postgresql://...?sslmode=require&connect_timeout=60&pool_timeout=60"
```

Or set environment variable:
```bash
export PRISMA_CLIENT_ENGINE_TYPE=binary
npx prisma db push
```

---

### 3. **Schema Already Exists / Migration Conflicts**

**Problem:** Prisma thinks tables exist but they don't (or vice versa).

**Solution:** Force push (⚠️ **WARNING**: This will drop existing data):

```bash
npx prisma db push --force-reset
```

Or accept data loss:
```bash
npx prisma db push --accept-data-loss
```

---

### 4. **Prisma Client Not Generated**

**Problem:** Prisma client is out of sync with schema.

**Solution:**
```bash
# Regenerate Prisma client
npx prisma generate

# Then push schema
npx prisma db push
```

---

### 5. **Network/Firewall Issues**

**Problem:** Connection drops during push.

**Solutions:**

**A. Use Supabase SQL Editor (Alternative Method):**

1. Go to Supabase Dashboard → SQL Editor
2. Run the SQL that Prisma would generate:
   ```sql
   -- Get the SQL from Prisma
   npx prisma migrate dev --create-only
   -- Then copy the SQL from the generated migration file
   ```
3. Paste and run in Supabase SQL Editor

**B. Check Connection Stability:**
```bash
# Test connection stability
npx tsx scripts/test-connection.ts

# If it works, try push again
npx prisma db push
```

---

### 6. **Large Schema / Many Indexes**

**Problem:** Creating many indexes takes time.

**Solution:** Push in stages:

1. Comment out some indexes in `schema.prisma`
2. Push: `npx prisma db push`
3. Uncomment indexes
4. Push again: `npx prisma db push`

---

### 7. **Prisma Version Issues**

**Problem:** Older Prisma versions have connection issues.

**Solution:** Update Prisma:
```bash
npm install prisma@latest @prisma/client@latest
npx prisma generate
npx prisma db push
```

---

### 8. **Supabase Project Paused**

**Problem:** Free tier projects pause after inactivity.

**Solution:**
1. Check Supabase Dashboard
2. If paused, click "Restart Project"
3. Wait 1-2 minutes
4. Try push again

---

### 9. **Use Prisma Migrate Instead**

**Alternative:** Use migrations instead of `db push`:

```bash
# Create migration
npx prisma migrate dev --name init

# This creates migration files you can review
# Then apply:
npx prisma migrate deploy
```

**Benefits:**
- More reliable for production
- Can review SQL before applying
- Better for version control

---

### 10. **Manual SQL Approach**

If all else fails, create tables manually:

1. **Get the SQL from Prisma:**
   ```bash
   npx prisma migrate dev --create-only --name init
   ```
   This creates a migration file in `prisma/migrations/` with the SQL.

2. **Copy the SQL** from the migration file

3. **Run in Supabase SQL Editor:**
   - Go to Supabase Dashboard → SQL Editor
   - Paste and execute the SQL

4. **Mark as applied:**
   ```bash
   npx prisma migrate resolve --applied init
   ```

---

## Quick Diagnostic Commands

```bash
# 1. Test connection
npx tsx scripts/test-connection.ts

# 2. Check Prisma version
npx prisma --version

# 3. Validate schema
npx prisma validate

# 4. Generate client
npx prisma generate

# 5. Try push with verbose output
DEBUG="*" npx prisma db push

# 6. Check what Prisma sees
npx prisma db pull
```

---

## Recommended Workflow

1. **Test connection first:**
   ```bash
   npx tsx scripts/test-connection.ts
   ```

2. **Validate schema:**
   ```bash
   npx prisma validate
   ```

3. **Generate client:**
   ```bash
   npx prisma generate
   ```

4. **Push schema:**
   ```bash
   npx prisma db push
   ```

5. **Verify in Supabase:**
   - Check Tables count in dashboard
   - Check SQL Editor → Table Editor

---

## If Nothing Works

**Last Resort - Manual Table Creation:**

1. Go to Supabase Dashboard → Table Editor
2. Click "New Table"
3. Create `Event` table with columns matching your schema
4. Create `EventContent` table
5. Set up relationships and indexes manually

Then mark Prisma as synced:
```bash
npx prisma db pull
```

---

## Pro Tips

- **Always backup** before `--force-reset` or `--accept-data-loss`
- **Use migrations** for production (not `db push`)
- **Test locally first** with a local PostgreSQL
- **Check Supabase logs** in dashboard for errors
- **Use connection pooling** for app, **direct connection** for migrations

