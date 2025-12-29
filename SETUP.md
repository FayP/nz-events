# Setup Guide for NZ Events

This guide will help you get the project up and running step by step.

## ✅ Already Completed
- ✅ Node.js dependencies installed
- ✅ Elasticsearch running locally in Docker

## 📋 Setup Steps

### 1. Install Dependencies (if not already done)
```bash
npm install
```

### 2. Set Up PostgreSQL Database

You need a PostgreSQL database. Options:

**Option A: Local PostgreSQL**
```bash
# Install PostgreSQL (if not installed)
# macOS: brew install postgresql@14
# Then start it: brew services start postgresql@14

# Create database
createdb nz_events
```

**Option B: Docker PostgreSQL**
```bash
docker run --name nz-events-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=nz_events \
  -p 5432:5432 \
  -d postgres:14
```

**Option C: Cloud Database (Supabase, Neon, etc.)**
- Sign up for a free PostgreSQL database
- Get your connection string

### 3. Create Environment Variables File

Create a `.env.local` file in the project root:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/nz_events?schema=public"

# Elasticsearch (already running)
ELASTICSEARCH_URL="http://localhost:9200"
# If your Elasticsearch requires authentication, uncomment:
# ELASTICSEARCH_AUTH="true"
# ELASTICSEARCH_USERNAME="elastic"
# ELASTICSEARCH_PASSWORD="your_password"

# OpenAI (Required for AI features)
OPENAI_API_KEY="your_openai_api_key_here"

# Sanity CMS (Optional - can skip for now)
# SANITY_PROJECT_ID="your_project_id"
# SANITY_DATASET="production"

# Web Search API (Optional - for event discovery)
# Choose one:
# SERP_API_KEY="your_serpapi_key"
# TAVILY_API_KEY="your_tavily_key"
```

**Important:** Replace the placeholder values with your actual credentials.

### 4. Set Up Database Schema

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push
```

### 5. Verify Elasticsearch Connection

Your Elasticsearch should be running at `http://localhost:9200`. Test it:

```bash
curl http://localhost:9200
```

If you get a JSON response, Elasticsearch is working!

### 6. Start the Development Server

```bash
npm run dev
```

The Elasticsearch index will be created automatically on the first API call.

### 7. Test the Setup

**Test Database:**
```bash
# Open Prisma Studio to view your database
npm run db:studio
```

**Test Elasticsearch Index:**
The index will be created automatically when you:
- Create an event via the API
- Or make a search request

**Test API Endpoints:**
```bash
# Create a test event
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Auckland Marathon",
    "eventType": "RUNNING",
    "startDate": "2024-10-20T00:00:00Z",
    "location": "Auckland Domain",
    "city": "Auckland",
    "region": "Auckland"
  }'

# Search for events
curl http://localhost:3000/api/search?q=marathon
```

## 🔧 Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running: `pg_isready` or check Docker container
- Check DATABASE_URL format matches your setup
- Ensure database exists: `psql -l` (should list nz_events)

### Elasticsearch Connection Issues
- Verify Elasticsearch is running: `curl http://localhost:9200`
- Check ELASTICSEARCH_URL matches your Docker setup
- If using Elasticsearch 8+, you might need authentication

### OpenAI API Issues
- Get your API key from https://platform.openai.com/api-keys
- Ensure OPENAI_API_KEY is set in `.env.local`
- Check you have API credits

### Prisma Issues
- Run `npm run db:generate` after schema changes
- Run `npm run db:push` to sync schema to database

## 🚀 Next Steps

Once everything is running:
1. Visit http://localhost:3000 to see the homepage
2. Visit http://localhost:3000/events to see events
3. Visit http://localhost:3000/search to test search
4. Use Prisma Studio (`npm run db:studio`) to manage your database

## 📝 Optional Services

These are optional and can be added later:

- **Sanity CMS**: For content management (can skip for now)
- **Web Search API**: For automated event discovery (can skip for now)

The app will work without these, but some AI features may be limited.

