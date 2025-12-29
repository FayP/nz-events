# Sanity CMS Setup Guide

This guide will help you set up Sanity CMS for managing event pages.

## Step 1: Create a Sanity Project

1. Go to [https://sanity.io](https://sanity.io) and sign up/login
2. Click "Create new project"
3. Choose a project name (e.g., "NZ Events")
4. Choose a dataset name (default: "production")
5. Copy your **Project ID** from the project settings

## Step 2: Configure Environment Variables

Add these to your `.env.local` file:

```bash
SANITY_PROJECT_ID=your_project_id_here
SANITY_DATASET=production

# For Next.js (optional, for client-side)
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_SANITY_DATASET=production
```

## Step 3: Install Sanity CLI (if not already installed)

```bash
npm install -g @sanity/cli
```

## Step 4: Authenticate with Sanity

```bash
sanity login
```

## Step 5: Sync Events to Sanity

Run the sync script to create event pages in Sanity from your database:

```bash
npm run sync:sanity
```

This will:
- Fetch all published events from your database
- Create corresponding event documents in Sanity
- Use the template structure defined in `sanity/schema/event.ts`

## Step 6: Start Sanity Studio (Optional)

To edit events in a visual interface:

```bash
npm run sanity:dev
```

This will open Sanity Studio at `http://localhost:3333` where you can:
- Edit event content
- Add images
- Update event details
- Manage all event pages

## Step 7: Deploy Sanity Studio (Optional)

To make Sanity Studio accessible online:

```bash
npm run sanity:deploy
```

This will deploy your studio to `https://your-project.sanity.studio`

## Event Page Template

Each event page in Sanity follows this template structure:

### Required Fields
- **Event ID**: Links to database event
- **Title**: Event name
- **Slug**: URL-friendly identifier
- **Event Type**: RUNNING, BIKING, or TRIATHLON
- **Event Details**: Date, location, city, region

### Optional Fields
- **Hero Image**: Main image for the page
- **Excerpt**: Short description for listings
- **Description**: Rich text full description
- **Distances**: Available categories
- **Registration**: URLs, dates, pricing
- **Organizer**: Contact information
- **Gallery**: Additional images
- **Highlights**: Key features
- **Course Info**: Course details
- **FAQ**: Frequently asked questions
- **SEO**: Meta tags and keywords

## Workflow

### When a New Event is Added to Database

1. **Automatic Sync** (Recommended):
   ```bash
   npm run sync:sanity
   ```
   This creates a new event page in Sanity with all database fields populated.

2. **Manual Enhancement**:
   - Open Sanity Studio (`npm run sanity:dev`)
   - Find the new event
   - Add images, enhance description, add FAQs, etc.
   - Publish the event

### When Editing an Event

1. Open Sanity Studio
2. Find and edit the event
3. Changes are saved automatically
4. The website will reflect changes immediately (if using CDN) or after rebuild

## AI-Powered Content Generation

You can enhance the sync script to automatically generate:
- Rich descriptions using OpenAI
- SEO-optimized titles and meta descriptions
- FAQs based on event type
- Highlights from event details

## Troubleshooting

### "Sanity client not configured"
- Make sure `SANITY_PROJECT_ID` and `SANITY_DATASET` are set in `.env.local`
- Restart your dev server after adding environment variables

### "Cannot find module 'sanity'"
- Run `npm install` to install Sanity dependencies

### Events not showing on website
- Make sure events are set to "published" status in Sanity
- Check that the slug matches the database slug
- Verify the event detail page route is working

## Next Steps

- Customize the event schema in `sanity/schema/event.ts`
- Add more fields as needed
- Set up image optimization
- Configure preview mode for draft events
- Add custom components to Sanity Studio

