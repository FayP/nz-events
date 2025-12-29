# Vercel Deployment Guide

This guide will help you deploy your NZ Events application to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at https://vercel.com (free tier available)
2. **GitHub/GitLab/Bitbucket Account**: Vercel works best with Git integration
3. **Cloud Database**: Your PostgreSQL database needs to be accessible from the internet
4. **Cloud Elasticsearch**: Or use Vercel's serverless functions with a cloud Elasticsearch service

## Step 1: Push Code to Git Repository

First, push your code to a Git repository (GitHub, GitLab, or Bitbucket):

```bash
# If you haven't already, create a repository on GitHub/GitLab
# Then push your code:
git remote add origin <your-repo-url>
git push -u origin main
```

## Step 2: Prepare for Deployment

### Database Setup

Your PostgreSQL database needs to be accessible from Vercel. Options:

1. **Supabase** (Recommended - Free tier available)
   - Sign up at https://supabase.com
   - Create a new project
   - Get your connection string from Settings > Database
   - Update `DATABASE_URL` in Vercel environment variables

2. **Neon** (Serverless PostgreSQL)
   - Sign up at https://neon.tech
   - Create a project
   - Get connection string
   - Update `DATABASE_URL` in Vercel

3. **Railway** or **Render**
   - Both offer free PostgreSQL databases
   - Get connection string after setup

### Elasticsearch Setup

For production, you'll need a cloud Elasticsearch service:

1. **Elastic Cloud** (Free trial available)
   - Sign up at https://cloud.elastic.co
   - Create a deployment
   - Get your Elasticsearch URL and credentials

2. **Bonsai** (Elasticsearch as a Service)
   - Sign up at https://bonsai.io
   - Create a cluster
   - Get connection details

## Step 3: Deploy to Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. Go to https://vercel.com and sign in
2. Click "Add New Project"
3. Import your Git repository
4. Vercel will auto-detect Next.js settings
5. Configure environment variables (see below)
6. Click "Deploy"

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# For production deployment
vercel --prod
```

## Step 4: Environment Variables

Add these environment variables in Vercel Dashboard (Settings > Environment Variables):

### Required

```
DATABASE_URL=postgresql://user:password@host:port/database?schema=public
ELASTICSEARCH_URL=https://your-elasticsearch-url.com
OPENAI_API_KEY=your_openai_api_key
```

### Optional (but recommended)

```
SANITY_PROJECT_ID=your_sanity_project_id
SANITY_DATASET=production
SANITY_API_TOKEN=your_sanity_api_token
NEXT_PUBLIC_SANITY_PROJECT_ID=your_sanity_project_id
NEXT_PUBLIC_SANITY_DATASET=production
```

### If Elasticsearch requires authentication:

```
ELASTICSEARCH_AUTH=true
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=your_password
```

## Step 5: Build Configuration

Vercel will automatically:
- Detect Next.js
- Run `npm install`
- Run `npm run build`
- Deploy your application

### Prisma Setup

The project includes a `postinstall` script that generates Prisma client. Make sure your `package.json` has:

```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

## Step 6: Post-Deployment Setup

After deployment:

1. **Run Database Migrations**:
   ```bash
   # Via Vercel CLI or add as a build script
   vercel env pull .env.local
   npx prisma db push
   ```

2. **Populate Events** (if needed):
   ```bash
   # You can run this locally pointing to production DB
   # Or create a Vercel serverless function to do it
   npm run populate:events
   ```

3. **Sync to Sanity** (if using CMS):
   ```bash
   npm run sync:sanity
   ```

## Step 7: Custom Domain (Optional)

1. Go to your project in Vercel Dashboard
2. Settings > Domains
3. Add your custom domain
4. Follow DNS configuration instructions

## Troubleshooting

### Build Fails

- Check build logs in Vercel Dashboard
- Ensure all environment variables are set
- Verify database connection string is correct
- Check that Prisma client generates correctly

### Database Connection Issues

- Verify `DATABASE_URL` is accessible from internet
- Check firewall settings on your database
- Ensure connection string format is correct

### Elasticsearch Issues

- Verify `ELASTICSEARCH_URL` is correct
- Check authentication credentials if required
- Ensure Elasticsearch allows connections from Vercel IPs

### Prisma Issues

- Make sure `prisma generate` runs during build
- Check that `DATABASE_URL` is set correctly
- Verify Prisma schema is valid

## Environment Variables Checklist

Before deploying, make sure you have:

- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `ELASTICSEARCH_URL` - Elasticsearch endpoint
- [ ] `OPENAI_API_KEY` - OpenAI API key
- [ ] `SANITY_PROJECT_ID` - (Optional) Sanity project ID
- [ ] `SANITY_DATASET` - (Optional) Sanity dataset name
- [ ] `SANITY_API_TOKEN` - (Optional) Sanity API token
- [ ] `ELASTICSEARCH_AUTH` - (If needed) Set to "true"
- [ ] `ELASTICSEARCH_USERNAME` - (If needed) Elasticsearch username
- [ ] `ELASTICSEARCH_PASSWORD` - (If needed) Elasticsearch password

## Next Steps After Deployment

1. Test all pages and functionality
2. Set up monitoring (Vercel Analytics)
3. Configure custom domain
4. Set up CI/CD for automatic deployments
5. Add error tracking (Sentry, etc.)

## Support

- Vercel Docs: https://vercel.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment
- Prisma on Vercel: https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel

