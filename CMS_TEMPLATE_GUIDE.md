# Event Page CMS Template Guide

## Overview

Each event in your database can have a corresponding rich content page in Sanity CMS. The template is designed to make it easy to create and manage event pages.

## Template Structure

### 1. **Basic Information** (Auto-populated from database)
- Event ID (links to database)
- Title
- Slug (URL)
- Event Type

### 2. **Visual Content**
- **Hero Image**: Main image displayed at the top
- **Gallery**: Additional images in a grid
- **Excerpt**: Short description for listings

### 3. **Rich Content**
- **Description**: Full rich text description with:
  - Headings (H2, H3)
  - Paragraphs
  - Lists (bulleted, numbered)
  - Quotes
  - Inline images

### 4. **Event Details** (Auto-populated)
- Start/End dates
- Location, City, Region
- Coordinates (for maps)
- Full address

### 5. **Event-Specific Information**
- **Distances**: Available categories (5K, 10K, etc.)
- **Registration**: URLs, dates, pricing
- **Organizer**: Contact information

### 6. **Enhanced Content** (Optional)
- **Highlights**: Key features of the event
- **Course Info**: Detailed course information
- **FAQ**: Frequently asked questions

### 7. **SEO**
- SEO title
- Meta description
- Keywords

## Workflow for New Events

### Option 1: Automatic Sync (Recommended)

When you add a new event to the database:

```bash
npm run sync:sanity
```

This automatically:
1. Creates a new event page in Sanity
2. Populates all database fields
3. Sets up the basic structure
4. Marks it as "published"

Then you can:
- Open Sanity Studio to add images
- Enhance the description
- Add FAQs, highlights, etc.

### Option 2: Manual Creation

1. Open Sanity Studio: `npm run sanity:dev`
2. Click "Create new Event"
3. Fill in the Event ID (from database)
4. The template will guide you through all fields

## Template Fields Explained

### Hero Image
- **Purpose**: Main visual for the event page
- **Recommended**: High-quality image (1200x600px)
- **Usage**: Displayed at the top of the page

### Description (Rich Text)
- **Purpose**: Full event description
- **Features**: 
  - Formatting (bold, italic)
  - Headings for sections
  - Lists for features
  - Inline images
- **Tip**: Use H2 for main sections, H3 for subsections

### Distances
- **Format**: Array of strings
- **Examples**: ["5K", "10K", "Half Marathon", "Full Marathon"]
- **Usage**: Displayed as badges on the page

### Registration Information
- **Registration URL**: Direct link to registration
- **Website**: Event website
- **Dates**: When registration opens/closes
- **Price**: Early bird and standard pricing

### Highlights
- **Purpose**: Quick bullet points of key features
- **Format**: Array of strings
- **Example**: 
  - "Scenic coastal route"
  - "Professional timing"
  - "Finisher medals"
  - "Post-race refreshments"

### Course Info
- **Purpose**: Detailed course information
- **Format**: Array of objects with title and content
- **Example**:
  ```json
  [
    {
      "title": "Start Location",
      "content": "The race starts at..."
    },
    {
      "title": "Course Description",
      "content": "The course takes you through..."
    }
  ]
  ```

### FAQ
- **Purpose**: Answer common questions
- **Format**: Array of question/answer pairs
- **Tip**: Think about what participants typically ask

## Best Practices

1. **Always sync after adding events to database**
   - Keeps CMS in sync
   - Ensures all events have pages

2. **Use consistent formatting**
   - Same heading structure across events
   - Consistent image sizes
   - Similar FAQ format

3. **Optimize images**
   - Use appropriate sizes
   - Compress before uploading
   - Use descriptive alt text

4. **SEO optimization**
   - Include location in SEO title
   - Use event type keywords
   - Write compelling descriptions

5. **Keep content fresh**
   - Update dates as they change
   - Add new images from previous events
   - Update FAQs based on feedback

## AI-Powered Enhancement

You can enhance the sync script to automatically generate:
- Rich descriptions from basic info
- SEO-optimized titles
- FAQs based on event type
- Highlights from event details

Example enhancement:
```typescript
// In sync script, after creating basic document:
const enhanced = await generateEventContent(event)
document.description = enhanced.description
document.faq = enhanced.faq
document.highlights = enhanced.highlights
```

## Troubleshooting

### Event not showing on website
- Check status is "published" in Sanity
- Verify slug matches database slug
- Check event detail page route

### Images not displaying
- Verify image URLs are correct
- Check Sanity image CDN settings
- Ensure images are published

### Sync script fails
- Verify SANITY_API_TOKEN has Editor permissions
- Check SANITY_PROJECT_ID and SANITY_DATASET are correct
- Ensure database event exists

## Next Steps

- Customize the schema in `sanity/schema/event.ts`
- Add more fields as needed
- Set up preview mode for drafts
- Add custom validation rules
- Create event-specific templates

