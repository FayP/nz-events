# PostgreSQL Database Hosting Guide

This guide covers secure PostgreSQL hosting options for your NZ Events application.

## Recommended Options

### 1. **Supabase** ⭐ (Recommended - Best for Next.js)

**Why Choose Supabase:**
- ✅ Free tier with 500MB database
- ✅ Built-in security (Row Level Security)
- ✅ Automatic backups
- ✅ Built-in connection pooling
- ✅ Easy to use dashboard
- ✅ Works seamlessly with Vercel
- ✅ Free SSL/TLS encryption
- ✅ Built-in API and auth (bonus features)

**Setup:**
1. Sign up at https://supabase.com
2. Create a new project
3. Go to Settings > Database
4. Copy your connection string
5. Use the "Connection Pooling" URL for better performance

**Security Features:**
- SSL/TLS encryption by default
- IP allowlisting available
- Row Level Security (RLS) policies
- Automatic backups
- Connection pooling to prevent connection exhaustion

**Pricing:** Free tier, then $25/month for Pro

---

### 2. **Neon** (Serverless PostgreSQL)

**Why Choose Neon:**
- ✅ Serverless (scales to zero)
- ✅ Free tier with 3GB storage
- ✅ Branching (like Git for databases)
- ✅ Automatic scaling
- ✅ Built for serverless apps
- ✅ Free SSL/TLS

**Setup:**
1. Sign up at https://neon.tech
2. Create a project
3. Copy connection string from dashboard
4. Use the connection string directly

**Security Features:**
- SSL/TLS by default
- Network isolation
- Automatic backups
- Point-in-time recovery

**Pricing:** Free tier, then usage-based

---

### 3. **Railway**

**Why Choose Railway:**
- ✅ Simple setup
- ✅ Free tier with $5 credit/month
- ✅ Easy PostgreSQL provisioning
- ✅ Good for small to medium apps
- ✅ Automatic SSL

**Setup:**
1. Sign up at https://railway.app
2. Create new project
3. Add PostgreSQL service
4. Copy connection string from Variables tab

**Security Features:**
- SSL/TLS encryption
- Private networking
- Automatic backups

**Pricing:** $5/month credit (free tier), then pay-as-you-go

---

### 4. **Render**

**Why Choose Render:**
- ✅ Free tier available
- ✅ Easy PostgreSQL setup
- ✅ Automatic SSL
- ✅ Good documentation

**Setup:**
1. Sign up at https://render.com
2. Create new PostgreSQL database
3. Copy connection string from dashboard

**Security Features:**
- SSL/TLS by default
- Private networking
- Automatic backups (on paid plans)

**Pricing:** Free tier (90 days), then $7/month

---

### 5. **PlanetScale** (MySQL) - Alternative

If you want to consider MySQL instead:
- ✅ Serverless MySQL
- ✅ Free tier
- ✅ Branching
- ✅ Excellent for scaling

---

## Security Best Practices

### 1. **Use SSL/TLS Connections**

All recommended providers include SSL by default. Your connection string should include:
```
?sslmode=require
```

Or in Prisma:
```
?sslmode=require&sslcert=&sslkey=&sslrootcert=
```

### 2. **Connection String Security**

**Never commit connection strings to Git!**

- ✅ Store in `.env.local` (local)
- ✅ Store in Vercel Environment Variables (production)
- ✅ Use different databases for dev/staging/production
- ✅ Rotate credentials regularly

### 3. **Database Access Control**

**Supabase:**
- Use Row Level Security (RLS) policies
- Create separate database users for different access levels
- Use connection pooling for better security

**Neon/Railway/Render:**
- Use strong passwords
- Limit IP access if possible
- Use separate databases for different environments

### 4. **Network Security**

- **IP Allowlisting**: Restrict database access to specific IPs (Vercel IPs)
- **Private Networking**: Use private networks when available
- **VPN**: For sensitive data, consider VPN access

### 5. **Backup Strategy**

- ✅ Enable automatic backups (all providers offer this)
- ✅ Test restore procedures
- ✅ Keep backups for at least 30 days
- ✅ Store backups in different regions

### 6. **Monitoring & Alerts**

- Set up alerts for:
  - Connection failures
  - High CPU/memory usage
  - Unusual query patterns
  - Database size approaching limits

---

## Recommended Setup for NZ Events

### For Development:
- **Supabase Free Tier** - Perfect for testing
- Easy to reset/clear data
- Good dashboard for managing data

### For Production:
- **Supabase Pro** ($25/month) or **Neon** (usage-based)
- Better performance
- More storage
- Better support

---

## Quick Setup: Supabase (Recommended)

### Step 1: Create Project
1. Go to https://supabase.com
2. Sign up/login
3. Click "New Project"
4. Choose organization
5. Enter project details:
   - Name: `nz-events`
   - Database Password: **Generate a strong password** (save it!)
   - Region: Choose closest to your users
6. Click "Create new project"

### Step 2: Get Connection String
1. Wait for project to finish setting up (~2 minutes)
2. Go to Settings > Database
3. Scroll to "Connection string"
4. Select "URI" tab
5. Copy the connection string
6. **Important**: Use the "Connection Pooling" URL for production (better performance)

### Step 3: Configure for Vercel
1. In Vercel Dashboard > Your Project > Settings > Environment Variables
2. Add:
   ```
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require
   ```
3. For connection pooling (recommended):
   ```
   DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require
   ```

### Step 4: Run Migrations
After deployment, run:
```bash
# Via Vercel CLI or add as build command
npx prisma db push
```

---

## Security Checklist

Before going to production:

- [ ] Database password is strong (16+ characters, mixed case, numbers, symbols)
- [ ] Connection string uses SSL (`sslmode=require`)
- [ ] Environment variables are set in Vercel (not in code)
- [ ] Different databases for dev/staging/production
- [ ] Automatic backups enabled
- [ ] Database access logs enabled
- [ ] IP restrictions configured (if available)
- [ ] Database user has minimal required permissions
- [ ] Connection pooling enabled (for Supabase)
- [ ] Regular security updates applied

---

## Connection String Examples

### Supabase (Direct)
```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require
```

### Supabase (Connection Pooling - Recommended)
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require
```

### Neon
```
postgresql://[USER]:[PASSWORD]@[ENDPOINT]/[DATABASE]?sslmode=require
```

### Railway
```
postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/railway?sslmode=require
```

---

## Troubleshooting

### Connection Timeout
- Check if database allows connections from Vercel IPs
- Verify connection string is correct
- Check SSL mode is set correctly

### Too Many Connections
- Use connection pooling (Supabase)
- Reduce connection pool size in Prisma
- Check for connection leaks

### SSL Errors
- Ensure `sslmode=require` is in connection string
- Verify SSL certificates are valid
- Check database provider's SSL requirements

---

## Next Steps

1. Choose a provider (Supabase recommended)
2. Create database
3. Get connection string
4. Add to Vercel environment variables
5. Test connection
6. Run migrations
7. Deploy!

For detailed setup instructions, see the provider's documentation.

