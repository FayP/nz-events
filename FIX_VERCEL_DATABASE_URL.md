# Fix DATABASE_URL Error in Vercel

## Error Message
```
Invalid `prisma.event.findMany()` invocation:
error: Error validating datasource `db`: the URL must start with the protocol `postgresql://` or `postgres://`
```

## Problem
The `DATABASE_URL` environment variable in Vercel is either:
- Not set
- Set incorrectly (missing protocol)
- Has extra quotes or whitespace
- Missing the password

## Solution

### Step 1: Get Your Correct Connection String

From your `.env.local` file, your connection string should be:
```
postgresql://postgres.bjfrmxtjwnbjbekrpwpj:[YOUR-PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require
```

**Important:** Replace `[YOUR-PASSWORD]` with your actual Supabase database password.

### Step 2: Update in Vercel

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

2. Find `DATABASE_URL`:
   - If it exists, **delete it** (to avoid any formatting issues)
   - If it doesn't exist, proceed to add it

3. **Add New Variable:**
   - **Key:** `DATABASE_URL`
   - **Value:** Paste your full connection string (the one from above with your password)
   - **Environment:** Select **ALL** (Production, Preview, Development)
   - Click **Save**

4. **Important:** 
   - Do NOT add quotes around the value
   - Do NOT add extra spaces
   - Make sure it starts with `postgresql://`
   - Make sure the password is correct

### Step 3: Redeploy

After saving the environment variable:
- Go to **Deployments** tab
- Click the **three dots** (⋯) on the latest deployment
- Click **Redeploy**
- Or push a new commit to trigger a redeploy

### Step 4: Verify

After redeploy, test:
- Visit: `https://nz-events-theta.vercel.app/api/events?status=PUBLISHED`
- Should return JSON with events (no error)

## Common Mistakes

❌ **Wrong:**
```
DATABASE_URL = "postgresql://..."
```
(Extra spaces, quotes in Vercel UI)

❌ **Wrong:**
```
postgres://... (missing 'ql')
```

❌ **Wrong:**
```
postgresql://postgres.bjfrmxtjwnbjbekrpwpj@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres
```
(Missing password)

✅ **Correct:**
```
postgresql://postgres.bjfrmxtjwnbjbekrpwpj:YOUR_PASSWORD_HERE@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require
```

## Get Your Password

If you forgot your Supabase password:
1. Go to Supabase Dashboard
2. Settings → Database
3. Click "Reset database password"
4. Copy the new connection string
5. Update in Vercel

## Still Not Working?

1. **Check Vercel Logs:**
   - Go to Deployments → Latest → Functions → `/api/events`
   - Look for connection errors

2. **Test Connection String:**
   - Copy the exact string from Vercel
   - Test locally: `npx tsx scripts/test-connection.ts`
   - If it works locally but not in Vercel, there's a formatting issue

3. **Verify Password:**
   - Make sure password doesn't have special characters that need URL encoding
   - If it does, URL-encode them (e.g., `@` → `%40`)

