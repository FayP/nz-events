# Elasticsearch Cloud Setup Guide

This guide will help you set up cloud Elasticsearch for your production deployment on Vercel.

## Why Cloud Elasticsearch?

- Vercel can't access `localhost:9200`
- You need a cloud-hosted Elasticsearch service
- Free trials available for testing

## Option 1: Elastic Cloud (Recommended)

### Step 1: Sign Up

1. Go to https://cloud.elastic.co
2. Click "Start free trial" or "Sign up"
3. Create an account (14-day free trial)

### Step 2: Create Deployment

1. After signing in, click **"Create deployment"**
2. Choose:
   - **Name:** `nz-events-search` (or any name)
   - **Cloud provider:** AWS, GCP, or Azure
   - **Region:** Choose closest to your users (e.g., `ap-southeast-1` for NZ)
   - **Version:** Latest (8.x recommended)
   - **Hardware:** Start with smallest (free tier or minimal)
3. Click **"Create deployment"**
4. Wait 5-10 minutes for deployment to complete

### Step 3: Get Connection Details

1. Once deployment is ready, click on it
2. Go to **"Endpoints"** section
3. Copy the **"Elasticsearch"** endpoint URL
   - Format: `https://[deployment-id].[region].cloud.es.io:9243`
   - Example: `https://abc123.ap-southeast-1.aws.cloud.es.io:9243`

### Step 4: Get Credentials

You have two options:

**Option A: API Key (Recommended - More Secure)**

1. In Elastic Cloud dashboard, go to **"Security"** → **"API Keys"**
2. Click **"Create API key"**
3. Give it a name (e.g., "nz-events-production")
4. Set permissions (usually "All" or "Read/Write")
5. Copy the API key (you'll only see it once!)
6. Save it securely!

**Option B: Username/Password (Alternative)**

1. In the deployment page, find **"Credentials"** section
2. Copy:
   - **Username:** Usually `elastic`
   - **Password:** Click "Reset password" if needed, or use the generated one
3. Save these securely!

### Step 5: Update Vercel Environment Variables

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

2. **If using API Key (Recommended):**

   **ELASTICSEARCH_URL:**
   ```
   https://[your-deployment-id].[region].cloud.es.io:9243
   ```
   (Use the endpoint from Step 3)

   **ELASTICSEARCH_API_KEY:**
   ```
   [your-api-key-from-step-4]
   ```

   That's it! No need for AUTH, USERNAME, or PASSWORD variables.

3. **If using Username/Password:**

   **ELASTICSEARCH_URL:**
   ```
   https://[your-deployment-id].[region].cloud.es.io:9243
   ```

   **ELASTICSEARCH_AUTH:**
   ```
   true
   ```

   **ELASTICSEARCH_USERNAME:**
   ```
   elastic
   ```

   **ELASTICSEARCH_PASSWORD:**
   ```
   [your-password-from-step-4]
   ```

4. Select **ALL** environments (Production, Preview, Development)
5. Click **Save**

### Step 6: Redeploy

1. Go to **Deployments** tab
2. Click **Redeploy** on latest deployment
3. Wait for deployment to complete

### Step 7: Initialize Index

After deployment, the index will be created automatically on first API call, or you can:

1. Visit: `https://nz-events-theta.vercel.app/api/search?q=test`
2. This will create the index and test the connection

---

## Option 2: Bonsai (Alternative)

### Step 1: Sign Up

1. Go to https://bonsai.io
2. Click "Start Free Trial"
3. Create an account (14-day free trial)

### Step 2: Create Cluster

1. After signing in, click **"Create Cluster"**
2. Choose:
   - **Name:** `nz-events`
   - **Region:** Closest to NZ
   - **Plan:** Free tier or starter
3. Click **"Create"**

### Step 3: Get Connection URL

1. Once cluster is ready, click on it
2. Find the **"Connection URL"**
   - Format: `https://[cluster-id].[region].bonsaisearch.net`
   - Example: `https://abc123.ap-southeast-1.bonsaisearch.net`

### Step 4: Get Credentials

1. In cluster settings, find **"Access"** section
2. Copy:
   - **Username:** Usually provided
   - **Password:** Generated password

### Step 5: Update Vercel

Same as Elastic Cloud Step 5, but use Bonsai URL format.

---

## Option 3: Self-Hosted (Advanced)

If you have your own server:

1. Set up Elasticsearch on a VPS (DigitalOcean, AWS EC2, etc.)
2. Configure firewall to allow Vercel IPs
3. Use HTTPS endpoint
4. Set credentials

---

## Testing Your Setup

### 1. Test Connection

After setting up, test the API:
```
https://nz-events-theta.vercel.app/api/search?q=marathon
```

Should return search results.

### 2. Check Vercel Logs

- Go to Vercel Dashboard → Functions → `/api/search`
- Look for connection errors
- Should see successful Elasticsearch queries

### 3. Index Events

Events should auto-index when:
- New events are created
- Events are updated
- Or visit: `https://nz-events-theta.vercel.app/api/events` (triggers indexing)

---

## Troubleshooting

### Connection Timeout

- Check firewall settings
- Verify endpoint URL is correct
- Make sure using HTTPS (not HTTP)

### Authentication Failed

- Verify username and password
- Check if credentials are URL-encoded correctly
- Reset password in Elastic Cloud/Bonsai

### Index Not Found

- Index is created automatically on first search
- Or manually create via API call
- Check Vercel logs for errors

### Still Using Localhost

- Make sure `ELASTICSEARCH_URL` is updated in Vercel
- Redeploy after updating environment variables
- Check that old value isn't cached

---

## Cost Considerations

### Elastic Cloud
- **Free Trial:** 14 days
- **After Trial:** Pay-as-you-go (~$16/month for minimal setup)
- **Scales:** Automatically

### Bonsai
- **Free Trial:** 14 days
- **After Trial:** Starts at ~$10/month
- **Managed:** Fully managed service

### Recommendation

Start with **Elastic Cloud** free trial, then:
- Monitor usage
- Scale down if needed
- Consider Bonsai if you prefer simpler pricing

---

## Quick Reference

### Environment Variables Needed:

**Option 1: API Key (Recommended):**
```
ELASTICSEARCH_URL=https://[deployment].cloud.es.io:9243
ELASTICSEARCH_API_KEY=[your-api-key]
```

**Option 2: Username/Password:**
```
ELASTICSEARCH_URL=https://[deployment].cloud.es.io:9243
ELASTICSEARCH_AUTH=true
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=[your-password]
```

### Test Endpoint:
```
https://nz-events-theta.vercel.app/api/search?q=test
```

---

## Next Steps

1. ✅ Set up Elastic Cloud or Bonsai
2. ✅ Get connection URL and credentials
3. ✅ Add environment variables to Vercel
4. ✅ Redeploy
5. ✅ Test search functionality
6. ✅ Index existing events

Your search functionality will work once Elasticsearch is configured!

