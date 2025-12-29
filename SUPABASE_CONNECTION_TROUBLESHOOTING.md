# Supabase Connection Troubleshooting

## Error: P1001 - Can't reach database server

This error means your application can't connect to Supabase. Here's how to fix it:

## ✅ Step-by-Step Fix

### 1. Check Your Supabase Project Status

1. Go to https://supabase.com/dashboard
2. Select your project
3. **Check if the project is paused** (free tier projects pause after inactivity)
4. If paused, click **"Restart Project"** and wait 1-2 minutes

### 2. Verify Connection String in Supabase Dashboard

1. In Supabase Dashboard → **Settings** → **Database**
2. Scroll to **"Connection string"**
3. Select **"URI"** tab
4. **Copy the EXACT connection string** (don't modify it)
5. Make sure it says `/postgres` (not `/postgre`)

**Important:** The connection string should look like:
```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require
```

### 3. Update Your .env.local

Replace your `DATABASE_URL` with the EXACT string from Supabase:

```bash
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require&connect_timeout=30"
```

**Common mistakes:**
- ❌ `/postgre` instead of `/postgres`
- ❌ Missing `?sslmode=require`
- ❌ Wrong password (copy it exactly)
- ❌ Extra spaces or quotes

### 4. Try Connection Pooling (Recommended)

Connection pooling is more reliable for serverless applications:

1. In Supabase Dashboard → **Settings** → **Database**
2. Find **"Connection Pooling"** section
3. Copy the **"Connection string"** (URI format)
4. It should use port **6543** instead of 5432
5. Update your `DATABASE_URL` with this URL

**Pooling URL format:**
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require
```

### 5. Test the Connection

```bash
npx tsx scripts/test-connection.ts
```

## 🔍 Common Issues & Solutions

### Issue: Project is Paused
**Solution:** Restart your project in Supabase dashboard

### Issue: Wrong Database Name
**Error:** Connection works but can't find tables
**Solution:** Make sure it's `/postgres` not `/postgre`

### Issue: Password Contains Special Characters
**Solution:** URL-encode special characters in your password:
- `@` → `%40`
- `#` → `%23`
- `!` → `%21`
- etc.

### Issue: Connection Timeout
**Solution:** Add timeout parameters:
```
?sslmode=require&connect_timeout=30&pool_timeout=30
```

### Issue: Network/Firewall
**Solution:** 
- Check if you're behind a corporate firewall
- Try from a different network
- Check Supabase status: https://status.supabase.com/

## 🧪 Manual Connection Test

Test with `psql` (if installed):

```bash
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require"
```

If this works, the issue is with Prisma/Node.js configuration.
If this fails, the issue is with network/Supabase.

## 📋 Checklist

Before asking for help, verify:

- [ ] Supabase project is running (not paused)
- [ ] Connection string copied EXACTLY from Supabase dashboard
- [ ] Database name is `/postgres` (not `/postgre`)
- [ ] Connection string includes `?sslmode=require`
- [ ] Password is correct (no typos)
- [ ] Tried connection pooling URL
- [ ] Added timeout parameters
- [ ] Tested from different network (if behind firewall)

## 🆘 Still Not Working?

1. **Check Supabase Status:** https://status.supabase.com/
2. **Restart Project:** Dashboard → Settings → Restart Project
3. **Verify Credentials:** Double-check password in Supabase dashboard
4. **Try Different Connection Method:** Use connection pooling instead of direct
5. **Contact Support:** Supabase Discord or support

## 💡 Pro Tips

- **Always use connection pooling** for production (port 6543)
- **Keep connection string in `.env.local`** (never commit to Git)
- **Use different databases** for dev/staging/production
- **Test connection** after any changes

