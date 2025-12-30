# Event Page Redesign Plan

Based on findarace.com layout analysis, here's the plan to enhance our event pages and homepage.

## 🏠 Homepage Redesign (NEW - Priority 0)

### Current Homepage:

- Simple landing page with title and two buttons
- Users have to click to see events
- Search is on separate page

### New Homepage Design:

**Replace homepage with filtered events list + search**

```
┌─────────────────────────────────────────┐
│ NZ Events                                │
│                                          │
│ [Search Bar - Prominent]                 │
│                                          │
│ ┌───────────────────────────────────┐   │
│ │ Filters (Sidebar or Top Bar)     │   │
│ │                                   │   │
│ │ Event Type:                       │   │
│ │ ☑ Running                         │   │
│ │ ☐ Cycling                         │   │
│ │ ☐ Triathlon                       │   │
│ │                                   │   │
│ │ Distance (if Running/Tri selected):│   │
│ │ Running:                           │   │
│ │ ☐ 5K                              │   │
│ │ ☐ 10K                             │   │
│ │ ☐ Half Marathon                  │   │
│ │ ☐ Marathon                        │   │
│ │ Triathlon:                         │   │
│ │ ☐ Sprint                          │   │
│ │ ☐ Olympic                         │   │
│ │ ☐ 70.3 Half Ironman              │   │
│ │ ☐ Ironman                         │   │
│ │                                   │   │
│ │ Location:                         │   │
│ │ [Dropdown: All Regions ▼]        │   │
│ │ ☐ Auckland                        │   │
│ │ ☐ Wellington                      │   │
│ │ ☐ Christchurch                    │   │
│ │ ☐ ...                             │   │
│ │                                   │   │
│ │ [Clear Filters]                   │   │
│ └───────────────────────────────────┘   │
│                                          │
│ ┌───────────────────────────────────┐   │
│ │ Events (Grid/List View)          │   │
│ │                                   │   │
│ │ [Event Card] [Event Card]        │   │
│ │ [Event Card] [Event Card]        │   │
│ │                                   │   │
│ │ Showing 9 of 9 events            │   │
│ └───────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

**Key Features:**

- ✅ Search bar at top (moved from /search page)
- ✅ Filters sidebar/top bar:
  - Event Type (Running, Cycling, Triathlon)
  - Distance (sub-filter, appears when Running selected)
  - Location/Region (dropdown or checkboxes)
- ✅ Events grid/list view
- ✅ Real-time filtering (no page reload)
- ✅ URL params for shareable filtered views
- ✅ Clear filters button
- ✅ Results count

**Benefits:**

- Users see events immediately
- Quick filtering with few clicks
- Search + filters work together
- Better UX for finding specific events

---

# Event Page Redesign Plan

Based on findarace.com layout analysis, here's the plan to enhance our event pages.

## Current State Analysis

### What We Have:

- ✅ Hero image
- ✅ Event details (date, location)
- ✅ Description
- ✅ Distances
- ✅ Registration section
- ✅ Highlights
- ✅ FAQ
- ✅ Gallery

### What We're Missing:

- ❌ Key info hero section (date, time, price, distances count at top)
- ❌ Interactive map
- ❌ Reviews section
- ❌ "Who's In" social proof
- ❌ Related events
- ❌ Share functionality
- ❌ Better price display
- ❌ Organizer info section
- ❌ Time display (currently only date)

---

## Proposed New Layout

### 1. Hero Section (Top of Page)

**Layout:** Key information prominently displayed at the top

```
┌─────────────────────────────────────────┐
│ [Hero Image - Full Width]              │
│                                         │
│ Event Name (Large)                     │
│ Event Type Badge                       │
│                                         │
│ 📅 Date: Fri 1st November 2024         │
│ ⏰ Time: 8:00AM                        │
│ 📍 Location: Various Cities, CA        │
│ 💰 Price: Free - $109.65              │
│ 🏃 Races: 3 distances                 │
│                                         │
│ [Book Now] [Share]                     │
└─────────────────────────────────────────┘
```

**Features:**

- Large, prominent event name
- All key info visible immediately
- Call-to-action buttons (Book Now, Share)
- Event type badge
- Price range display

---

### 2. Event Summary Section

**Layout:** Rich description with "Read more" expandable

- Full event description
- Expandable/collapsible for long descriptions
- Rich text formatting support

---

### 3. Location & Map Section

**Layout:** Map with location details

```
┌─────────────────────────────────────────┐
│ Location                                │
│                                         │
│ [Interactive Map]                      │
│                                         │
│ Address: 356 Highland Avenue           │
│ City, Region, Country                  │
│                                         │
│ [Get Directions]                        │
└─────────────────────────────────────────┘
```

**Features:**

- Google Maps or Mapbox integration
- Clickable "Get Directions" link
- Coordinates from database (latitude/longitude)
- Fallback to address if no coordinates

---

### 4. Races/Distances Breakdown

**Layout:** Detailed breakdown of each distance/race

```
┌─────────────────────────────────────────┐
│ Races                                   │
│                                         │
│ ┌─────────────────────────────────┐   │
│ │ Half Marathon                   │   │
│ │ Fri 1st November 2024 (8:00AM) │   │
│ │ $109.65                         │   │
│ │ [Book]                          │   │
│ └─────────────────────────────────┘   │
│                                         │
│ ┌─────────────────────────────────┐   │
│ │ 10K                             │   │
│ │ Fri 1st November 2024 (8:00AM) │   │
│ │ $75.00                          │   │
│ │ [Book]                          │   │
│ └─────────────────────────────────┘   │
│                                         │
│ ┌─────────────────────────────────┐   │
│ │ 5K                              │   │
│ │ Fri 1st November 2024 (8:00AM) │   │
│ │ Free                            │   │
│ │ [Book]                          │   │
│ └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

**Features:**

- Individual cards for each distance
- Price per distance
- Registration button per distance
- Date/time per distance (if different)

---

### 5. Organizer Information

**Layout:** Organizer details section

- Organizer name
- Organizer logo/image
- Organizer description
- Contact information
- Link to organizer's other events

---

### 6. Reviews Section

**Layout:** User reviews with ratings

```
┌─────────────────────────────────────────┐
│ Reviews                                 │
│                                         │
│ ⭐⭐⭐⭐⭐ (4.5) - 12 reviews          │
│                                         │
│ ┌─────────────────────────────────┐   │
│ │ John D. ⭐⭐⭐⭐⭐                │   │
│ │ "Great event! Well organized..." │   │
│ │ 2 weeks ago                      │   │
│ └─────────────────────────────────┘   │
│                                         │
│ [Add Review] [View All Reviews]        │
└─────────────────────────────────────────┘
```

**Features:**

- Star ratings
- Review text
- Reviewer name (optional)
- Review date
- "Add Review" button
- Pagination for many reviews

**Database Schema Addition Needed:**

- `EventReview` model with:
  - eventId
  - rating (1-5)
  - review text
  - reviewer name (optional)
  - createdAt
  - verified (boolean)

---

### 7. Who's In Section

**Layout:** Social proof showing attendees

```
┌─────────────────────────────────────────┐
│ Who's In                                │
│                                         │
│ 👥 45 people are doing this event      │
│                                         │
│ [Avatar] [Avatar] [Avatar] +42 more    │
│                                         │
│ [I'm In] [Maybe]                       │
└─────────────────────────────────────────┘
```

**Features:**

- Count of attendees
- Avatar display
- "I'm In" / "Maybe" buttons
- Link to full attendee list

**Database Schema Addition Needed:**

- `EventAttendee` model with:
  - eventId
  - userId (or anonymous identifier)
  - status (going, maybe, not going)
  - createdAt

---

### 8. Related Events Section

**Layout:** Recommendations for similar events

```
┌─────────────────────────────────────────┐
│ You might like                          │
│                                         │
│ [Event Card] [Event Card] [Event Card] │
│                                         │
│ [View All Similar Events]               │
└─────────────────────────────────────────┘
```

**Features:**

- Events of same type
- Events in same region
- Events around same date
- Event cards with image, name, date, location

---

## Implementation Plan

### Phase 0: Homepage Redesign (NEW - Highest Priority)

1. ✅ Replace homepage with events list
2. ✅ Move search bar to homepage
3. ✅ Add filter sidebar/top bar:
   - Event Type filter (Running, Cycling, Triathlon)
   - Distance sub-filter (appears when Running selected)
   - Location/Region filter
4. ✅ Implement real-time filtering
5. ✅ URL params for shareable filtered views
6. ✅ Remove /search page (or redirect to homepage)
7. ✅ Update /events page (can redirect to homepage or keep as backup)

### Phase 1: Core Layout Updates (Priority 1)

1. ✅ Redesign hero section with key info at top
2. ✅ Add time display (currently missing)
3. ✅ Improve price display
4. ✅ Add share functionality
5. ✅ Reorganize layout to match findarace.com structure

### Phase 2: Map Integration (Priority 2)

1. ✅ Add interactive map component
2. ✅ Use Google Maps or Mapbox
3. ✅ Display location with coordinates
4. ✅ Add "Get Directions" link

### Phase 3: Enhanced Sections (Priority 3)

1. ✅ Improve races/distances breakdown
2. ✅ Add organizer information section
3. ✅ Enhance location display

### Phase 4: Social Features (Priority 4)

1. ⏳ Add reviews system (database + UI)
2. ⏳ Add "Who's In" feature (database + UI)
3. ⏳ Add related events section

---

## Technical Requirements

### New Dependencies Needed:

- Map library: `@react-google-maps/api` or `react-map-gl` (Mapbox)
- Share functionality: `react-share` or native Web Share API
- Date/time formatting: Already have, but may need timezone support

### Database Schema Updates:

1. **EventReview** model:

   ```prisma
   model EventReview {
     id        String   @id @default(cuid())
     eventId   String
     event     Event    @relation(fields: [eventId], references: [id])
     rating    Int      // 1-5
     review    String   @db.Text
     reviewerName String?
     verified  Boolean  @default(false)
     createdAt DateTime @default(now())
     updatedAt DateTime @updatedAt
   }
   ```

2. **EventAttendee** model:
   ```prisma
   model EventAttendee {
     id        String   @id @default(cuid())
     eventId   String
     event     Event    @relation(fields: [eventId], references: [id])
     userId    String?  // Optional - can be anonymous
     status    String   // "going", "maybe", "not_going"
     createdAt DateTime @default(now())
   }
   ```

### API Endpoints Needed:

**For Homepage:**

- `GET /api/events` - Already exists, supports filters
- `GET /api/search` - Already exists, supports filters
- `GET /api/events/filters` - Get available filter options (regions, distances, etc.)

**For Event Pages:**

- `POST /api/events/[slug]/reviews` - Add review
- `GET /api/events/[slug]/reviews` - Get reviews
- `POST /api/events/[slug]/attendees` - Mark attendance
- `GET /api/events/[slug]/attendees` - Get attendees
- `GET /api/events/[slug]/related` - Get related events

---

## Design Considerations

### Mobile Responsiveness:

- Hero section stacks vertically on mobile
- Map takes full width on mobile
- Cards stack vertically on mobile
- Share buttons accessible on mobile

### Performance:

- Lazy load map component
- Lazy load related events
- Optimize images
- Static generation where possible

### Accessibility:

- Proper heading hierarchy
- Alt text for images
- Keyboard navigation
- Screen reader support

---

## Homepage Implementation Details

### Filter Logic:

1. **Event Type Filter:**
   - Checkboxes: Running, Cycling, Triathlon
   - Can select multiple
   - Filters events by `eventType` field

2. **Distance Filter (Sub-filter):**
   - Shows when "Running" OR "Triathlon" is selected
   - **Running distances:** 5K, 10K, Half Marathon, Marathon, Ultra
   - **Triathlon distances:** Sprint, Olympic, 70.3 Half Ironman, Ironman
   - Filters by `distances` array field
   - Can select multiple distances
   - Shows appropriate options based on selected event type

3. **Location Filter:**
   - Dropdown or checkboxes for regions
   - Options: All regions from database
   - Filters by `region` field
   - Can select multiple regions

### Search + Filters Integration:

- Search bar works with filters
- Filters apply to search results
- URL params: `/?q=marathon&eventType=RUNNING&distance=Half+Marathon&region=Auckland`
- Shareable filtered URLs

### UI/UX Considerations:

- Filters in sidebar (desktop) or collapsible top bar (mobile)
- Real-time updates (no page reload)
- Show active filter count
- "Clear all filters" button
- Results count updates dynamically
- Loading states during filtering

### Data Requirements:

- Need to extract unique regions from events
- Need to extract unique distances from events
- Can use aggregations from Elasticsearch or database query

---

## Next Steps

1. **Start with Phase 0** - Homepage redesign (events list + filters + search)
2. **Then Phase 1** - Core event page layout updates
3. **Add map integration** - Phase 2
4. **Enhance existing sections** - Phase 3
5. **Add social features** - Phase 4 (if needed)

Would you like me to start implementing Phase 0 (Homepage redesign)?
