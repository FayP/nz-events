// Sanity schema for Event pages
export default {
  name: 'event',
  title: 'Event',
  type: 'document',
  fields: [
    {
      name: 'eventId',
      title: 'Event ID',
      type: 'string',
      description: 'Reference to the event in the database',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'title',
      title: 'Event Title',
      type: 'string',
      description: 'The main title of the event',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'URL-friendly identifier',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'eventType',
      title: 'Event Type',
      type: 'string',
      options: {
        list: [
          { title: 'Running', value: 'RUNNING' },
          { title: 'Cycling', value: 'BIKING' },
          { title: 'Triathlon', value: 'TRIATHLON' },
        ],
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      description: 'Main image for the event page',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      description: 'Short description shown in listings',
      rows: 3,
      validation: (Rule: any) => Rule.max(200),
    },
    {
      name: 'description',
      title: 'Full Description',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
            { title: 'Quote', value: 'blockquote' },
          ],
          lists: [
            { title: 'Bullet', value: 'bullet' },
            { title: 'Number', value: 'number' },
          ],
        },
        {
          type: 'image',
          options: { hotspot: true },
        },
      ],
      description: 'Rich text description of the event',
    },
    {
      name: 'eventDetails',
      title: 'Event Details',
      type: 'object',
      fields: [
        {
          name: 'startDate',
          title: 'Start Date',
          type: 'datetime',
          validation: (Rule: any) => Rule.required(),
        },
        {
          name: 'endDate',
          title: 'End Date',
          type: 'datetime',
        },
        {
          name: 'location',
          title: 'Location',
          type: 'string',
          validation: (Rule: any) => Rule.required(),
        },
        {
          name: 'city',
          title: 'City',
          type: 'string',
          validation: (Rule: any) => Rule.required(),
        },
        {
          name: 'region',
          title: 'Region',
          type: 'string',
          validation: (Rule: any) => Rule.required(),
        },
        {
          name: 'address',
          title: 'Full Address',
          type: 'text',
          rows: 2,
        },
        {
          name: 'coordinates',
          title: 'Coordinates',
          type: 'object',
          fields: [
            { name: 'lat', title: 'Latitude', type: 'number' },
            { name: 'lng', title: 'Longitude', type: 'number' },
          ],
        },
      ],
    },
    {
      name: 'distances',
      title: 'Distances/Categories',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Available distances or categories (e.g., "5K", "10K", "Half Marathon")',
    },
    {
      name: 'registration',
      title: 'Registration Information',
      type: 'object',
      fields: [
        {
          name: 'website',
          title: 'Registration Website',
          type: 'url',
        },
        {
          name: 'registrationUrl',
          title: 'Direct Registration URL',
          type: 'url',
        },
        {
          name: 'registrationOpenDate',
          title: 'Registration Opens',
          type: 'datetime',
        },
        {
          name: 'registrationCloseDate',
          title: 'Registration Closes',
          type: 'datetime',
        },
        {
          name: 'price',
          title: 'Price Information',
          type: 'object',
          fields: [
            { name: 'earlyBird', title: 'Early Bird Price', type: 'string' },
            { name: 'standard', title: 'Standard Price', type: 'string' },
            { name: 'currency', title: 'Currency', type: 'string', initialValue: 'NZD' },
          ],
        },
      ],
    },
    {
      name: 'organizer',
      title: 'Organizer Information',
      type: 'object',
      fields: [
        { name: 'name', title: 'Organizer Name', type: 'string' },
        { name: 'email', title: 'Contact Email', type: 'email' },
        { name: 'website', title: 'Organizer Website', type: 'url' },
      ],
    },
    {
      name: 'courseMap',
      title: 'Course Map',
      type: 'image',
      description: 'Map showing the race course/route',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'gallery',
      title: 'Image Gallery',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
      description: 'Additional images for the event',
    },
    {
      name: 'highlights',
      title: 'Event Highlights',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Key highlights or features of the event',
    },
    {
      name: 'courseInfo',
      title: 'Course Information',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'title', title: 'Section Title', type: 'string' },
            { name: 'content', title: 'Content', type: 'text', rows: 4 },
          ],
        },
      ],
    },
    {
      name: 'faq',
      title: 'Frequently Asked Questions',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'question', title: 'Question', type: 'string' },
            { name: 'answer', title: 'Answer', type: 'text', rows: 3 },
          ],
        },
      ],
    },
    {
      name: 'seo',
      title: 'SEO Settings',
      type: 'object',
      fields: [
        { name: 'title', title: 'SEO Title', type: 'string' },
        { name: 'description', title: 'SEO Description', type: 'text', rows: 3 },
        { name: 'keywords', title: 'Keywords', type: 'array', of: [{ type: 'string' }] },
      ],
    },
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'Published', value: 'published' },
        ],
      },
      initialValue: 'draft',
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'eventType',
      media: 'heroImage',
    },
  },
  orderings: [
    {
      title: 'Start Date, Newest',
      name: 'startDateDesc',
      by: [{ field: 'eventDetails.startDate', direction: 'desc' }],
    },
    {
      title: 'Start Date, Oldest',
      name: 'startDateAsc',
      by: [{ field: 'eventDetails.startDate', direction: 'asc' }],
    },
  ],
}

