# Vercel Environment Variables

## Required Variables

### 1. DATABASE_URL
Your Supabase PostgreSQL connection string (use connection pooling URL):
```
postgresql://postgres.bjfrmxtjwnbjbekrpwpj:[YOUR-PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require
```

**Get it from:**
- Your `.env.local` file
- Or Supabase Dashboard → Settings → Database → Connection Pooling → URI

### 2. ELASTICSEARCH_URL
Your Elasticsearch endpoint:
```
http://localhost:9200  (if local)
```
OR
```
https://your-elasticsearch-url.com  (if cloud)
```

**Note:** For production, you'll need a cloud Elasticsearch service:
- Elastic Cloud (https://cloud.elastic.co)
- Bonsai (https://bonsai.io)
- Or keep using local if you have a persistent server

### 3. OPENAI_API_KEY
Your OpenAI API key:
```
sk-...
```

**Get it from:**
- https://platform.openai.com/api-keys
- Your `.env.local` file

---

## Optional (Recommended for CMS Features)

### 4. SANITY_PROJECT_ID
```
jsiwg6tc
```

### 5. SANITY_DATASET
```
production
```

### 6. SANITY_API_TOKEN
Your Sanity API token with Editor permissions.

**Get it from:**
- https://sanity.io/manage
- Select your project → API → Tokens
- Create token with Editor permissions

### 7. NEXT_PUBLIC_SANITY_PROJECT_ID
Same as SANITY_PROJECT_ID (for client-side queries):
```
jsiwg6tc
```

### 8. NEXT_PUBLIC_SANITY_DATASET
Same as SANITY_DATASET (for client-side queries):
```
production
```

---

## Quick Copy-Paste for Vercel

### Required (Minimum):
```
DATABASE_URL=postgresql://postgres.bjfrmxtjwnbjbekrpwpj:[PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require
ELASTICSEARCH_URL=http://localhost:9200
OPENAI_API_KEY=sk-...
```

### Full Setup (Recommended):
```
DATABASE_URL=postgresql://postgres.bjfrmxtjwnbjbekrpwpj:[PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require
ELASTICSEARCH_URL=http://localhost:9200
OPENAI_API_KEY=sk-...
SANITY_PROJECT_ID=jsiwg6tc
SANITY_DATASET=production
SANITY_API_TOKEN=your_token_here
NEXT_PUBLIC_SANITY_PROJECT_ID=jsiwg6tc
NEXT_PUBLIC_SANITY_DATASET=production
```

---

## Important Notes

1. **Replace `[PASSWORD]`** in DATABASE_URL with your actual Supabase password
2. **ELASTICSEARCH_URL**: If using local Elasticsearch, Vercel won't be able to reach it. You'll need:
   - Cloud Elasticsearch service, OR
   - Remove Elasticsearch features for now
3. **NEXT_PUBLIC_*** variables are exposed to the browser - only use for public data
4. **Never commit** these values to Git - they're in `.env.local` which is gitignored

---

## Where to Add in Vercel

1. Go to your Vercel project dashboard
2. Settings → Environment Variables
3. Add each variable:
   - Name: `DATABASE_URL`
   - Value: (paste your connection string)
   - Environment: Production, Preview, Development (select all)
4. Repeat for each variable
5. Redeploy after adding variables

---

## Testing After Deployment

After deployment, test:
1. Homepage loads
2. Search works (if Elasticsearch is configured)
3. Event pages load
4. API routes work

If Elasticsearch isn't configured, search features won't work, but the rest of the site should function.

