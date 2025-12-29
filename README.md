# NZ Events Database

A modern, fast, and user-friendly website for discovering running, biking, and triathlon events in New Zealand.

## Features

- **Intuitive Search**: Elasticsearch-powered search with autocomplete and fuzzy matching
- **AI-Powered Content**: Automated event discovery and content generation
- **CMS Integration**: Easy content management with Sanity
- **Comprehensive Database**: Running, biking, and triathlon events across NZ
- **Modern UX**: Fast, beautiful, mobile-first design

## Tech Stack

- **Framework**: Next.js 14+ (App Router) with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Search**: Elasticsearch
- **AI**: OpenAI for content generation
- **CMS**: Sanity.io
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Elasticsearch instance (local or cloud)
- OpenAI API key
- (Optional) Sanity project
- (Optional) SerpAPI or Tavily API key for web search

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Set up environment variables:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration.

3. Set up the database:

```bash
npm run db:push
npm run db:generate
```

4. Initialize Elasticsearch index:

```bash
npm run dev
# The index will be created automatically on first API call
```

5. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
nz-events/
├── app/
│   ├── api/
│   │   ├── search/          # Search endpoints
│   │   ├── events/          # Event CRUD
│   │   └── ai/              # AI services
│   ├── events/              # Event pages
│   └── search/              # Search page
├── lib/
│   ├── elasticsearch.ts    # Elasticsearch client
│   ├── openai.ts           # OpenAI client
│   ├── web-search.ts       # Web search service
│   ├── cms.ts              # CMS client
│   └── services/           # Business logic
├── prisma/
│   └── schema.prisma       # Database schema
└── types/
    └── index.ts            # TypeScript types
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push schema to database
- `npm run db:generate` - Generate Prisma client
- `npm run db:studio` - Open Prisma Studio

## Environment Variables

See `.env.example` for all required environment variables.

## License

MIT
