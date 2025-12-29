# Migrating Database to Supabase

This guide will help you migrate your existing database (with events) to Supabase.

## Step 1: Get Your Supabase Connection String

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **Database**
4. Scroll down to **Connection string**
5. Select the **URI** tab
6. Copy the connection string

**Important:** Make sure the connection string includes `?sslmode=require` at the end.

**Example format:**
```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require
```

**Or use Connection Pooling (Recommended for production):**
```
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require
```

## Step 2: Update Your Environment Variables

Add your Supabase connection string to `.env.local`:

```bash
# Your Supabase connection string
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require"

# If you're migrating from a local database, temporarily add:
# SUPABASE_DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require"
```

## Step 3: Push Database Schema to Supabase

This creates the tables in your Supabase database:

```bash
# Generate Prisma client
npx prisma generate

# Push schema to Supabase
npx prisma db push
```

This will create all the necessary tables (`Event` and `EventContent`) in your Supabase database.

## Step 4: Migrate Your Data (If You Have Existing Events)

If you have events in your local database that you want to migrate:

### Option A: Using the Migration Script (Recommended)

1. **Temporarily** add your local database URL to `.env.local`:
   ```bash
   # Keep your Supabase URL as DATABASE_URL
   DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require"
   
   # Add your local database URL
   SUPABASE_DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require"
   ```

2. Run the migration script:
   ```bash
   npx tsx scripts/migrate-to-supabase.ts
   ```

   **Note:** The script will copy all events and their content from your local database to Supabase.

### Option B: Manual Migration (If you don't have local data)

If you don't have any events yet, or you want to start fresh:

1. Just run:
   ```bash
   npm run populate:events
   ```

   This will discover and add events directly to Supabase.

## Step 5: Verify the Migration

Test your connection:

```bash
npx tsx scripts/test-connection.ts
```

This should show:
- ✅ Database connection successful!
- 📊 Found X events in database

## Step 6: Update Your Local Development (Optional)

If you want to use Supabase for local development too:

1. Keep `DATABASE_URL` pointing to Supabase in `.env.local`
2. Your local development will now use the Supabase database

**Or** if you want separate databases:
- Keep local database for development
- Use Supabase only for production (Vercel)

## Troubleshooting

### Connection Timeout

If you get a connection timeout:
- Check that your Supabase project is active (not paused)
- Verify the connection string is correct
- Make sure `?sslmode=require` is included
- Check if your IP needs to be allowlisted (usually not needed for Supabase)

### SSL Errors

If you get SSL errors:
- Make sure `?sslmode=require` is at the end of your connection string
- Try using the connection pooling URL instead

### Schema Already Exists

If you get errors about tables already existing:
- You can reset the database in Supabase dashboard: **Settings** → **Database** → **Reset Database**
- Or manually drop tables if needed

### Migration Script Issues

If the migration script fails:
- Make sure both `DATABASE_URL` and `SUPABASE_DATABASE_URL` are set correctly
- Check that both databases are accessible
- Verify Prisma client is generated: `npx prisma generate`

## Next Steps

After migration:

1. ✅ Test the connection
2. ✅ Verify events are in Supabase
3. ✅ Update Vercel environment variables with the same `DATABASE_URL`
4. ✅ Deploy to Vercel

## Quick Reference

```bash
# 1. Get Supabase connection string from dashboard
# 2. Update .env.local with DATABASE_URL
# 3. Push schema
npx prisma generate
npx prisma db push

# 4. Migrate data (if needed)
npx tsx scripts/migrate-to-supabase.ts

# 5. Test connection
npx tsx scripts/test-connection.ts

# 6. Populate more events (optional)
npm run populate:events
```

---

**Need Help?**
- Supabase Docs: https://supabase.com/docs
- Prisma Docs: https://www.prisma.io/docs

