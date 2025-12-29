# Fix: IPv4 Compatibility Issue

## Problem

You're seeing the error: **"Not IPv4 compatible"** in Supabase. This means:
- Your network only supports IPv4
- Supabase's direct connection (port 5432) requires IPv6
- You need to use **Connection Pooling** instead

## Solution: Use Connection Pooling

### Step 1: Get Connection Pooling URL

1. In the Supabase "Connect to your project" modal:
   - Click **"Pooler settings"** button (or change "Method" to "Connection Pooling")
   - Select **"Session"** mode (recommended for Prisma)
   - Copy the connection string shown

2. The connection string should:
   - Use port **6543** (not 5432)
   - Have format: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@[POOLER-HOST]:6543/postgres`
   - Include `?sslmode=require` at the end

### Step 2: Update .env.local

Replace your `DATABASE_URL` with the connection pooling URL:

```bash
DATABASE_URL="postgresql://postgres.bjfrmxtjwnbjbekrpwpj:[YOUR-PASSWORD]@[POOLER-HOST].supabase.com:6543/postgres?sslmode=require"
```

**Important:** 
- Replace `[YOUR-PASSWORD]` with your actual database password
- Replace `[POOLER-HOST]` with the actual pooler host from Supabase
- Make sure it ends with `?sslmode=require`

### Step 3: Test Connection

```bash
npx tsx scripts/test-connection.ts
```

## Connection Pooling vs Direct Connection

| Feature | Direct Connection | Connection Pooling |
|---------|------------------|-------------------|
| Port | 5432 | 6543 |
| IPv4 Support | ❌ No | ✅ Yes |
| IPv6 Required | ✅ Yes | ❌ No |
| Best For | VMs, containers | Serverless, Vercel |
| Prisma | Works | ✅ Recommended |

## Why This Happens

- Supabase's direct connection uses IPv6
- Many networks (especially home/corporate) are IPv4-only
- Connection pooling works on IPv4 networks
- This is the recommended approach for serverless deployments anyway

## Quick Reference

**Direct Connection (IPv6 only):**
```
postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
```

**Connection Pooling (IPv4 compatible):**
```
postgresql://postgres.[PROJECT]:[PASSWORD]@[POOLER-HOST].supabase.com:6543/postgres?sslmode=require
```

## Still Having Issues?

1. Make sure you selected **"Session"** mode (not "Transaction")
2. Verify the connection string includes `?sslmode=require`
3. Check that your password is correct
4. Try copying the connection string directly from Supabase (don't modify it)

