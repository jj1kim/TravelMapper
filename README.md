# TravelMapper

> A travel scheduler for those who want flexibility without chaos.

TravelMapper isn't about building a rigid itinerary. It's about saving all your options in advance, then picking what to do on the fly based on how your trip unfolds.

---

## Key Features

### Trip Timetable
- Full 24-hour timeline with minute-level event positioning and 30-minute grid lines
- Overview of all dates at a glance + detailed day view on tap
- Confirmed events reflected in real time

### Wishlist
- **Transport** -- Flight/train name, departure/arrival locations (Google Maps integration), times, cost
- **Food / Cafe & Dessert / Attractions** -- Location, business hours (drag-to-record on a timetable), cost
- **Accommodation** -- Location, check-in/check-out times, stay dates (calendar range selection), cost
- Free-text notes on every item with automatic URL hyperlinking

### Confirming Events
- **Transport & Accommodation** -- One-tap confirm, instantly shown on the timetable
- **Food / Cafe / Attractions** -- Drag to set confirmed time within business hours (overlap prevention enforced)

### "What Can I Do?"
- Drag to select a free time slot on the timetable
- Automatically filters wishlist items whose business hours overlap by 30+ minutes
- Confirm events directly from the suggestion panel

### Route Lookup
- Select two confirmed events on the timetable
- Opens Google Maps transit directions in a new tab
- Departure time is automatically set to when the first event ends

### Cost Management
- Per-person cost calculated automatically from total cost and participant count
- Category-level cost breakdown shown in a tooltip

### And More
- Dark mode support
- Schedule expiration (default 90 days) with extension
- Trip D-day / "Day N" / post-trip status display
- Editable participant list
- Mobile-responsive design

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Database | Supabase (PostgreSQL) / SQLite (local dev) |
| Maps | Google Maps Places API (New), Maps JavaScript API |
| Deployment | Vercel |

---

## Getting Started

### Local Development

```bash
# Install dependencies
npm install

# Start dev server (runs on SQLite automatically without Supabase)
npm run dev
```

Open `http://localhost:3000`

### Environment Variables (Optional)

```bash
cp .env.local.example .env.local
```

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | For deployment |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | For deployment |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps API key | For place search |

> Without a Google Maps API key, locations can still be entered as plain text.

---

## Deployment

### Vercel + Supabase

1. Push to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Connect Supabase via Vercel Storage
4. Run `supabase-schema.sql` in the Supabase SQL Editor
5. Add Google Maps API key to environment variables
6. Redeploy

---

## Project Structure

```
src/
  app/
    api/                # API routes (schedules, wishlist, directions)
    page.tsx            # Main page (landing / calendar / timeline)
    layout.tsx          # Root layout
    globals.css         # Global styles + dark mode
  components/
    Timeline.tsx        # Timetable (overview + day detail)
    WishlistPanel.tsx   # Wishlist side panel
    WhatToDoPanel.tsx   # "What Can I Do?" panel
    CalendarPicker.tsx  # Trip date range picker
    TransportForm.tsx   # Transport event form
    PlaceForm.tsx       # Food / cafe / attraction form
    StayForm.tsx        # Accommodation form
    DragTimeTable.tsx   # Drag-to-select timetable (business hours / confirm)
    ConfirmScheduleModal.tsx  # Confirm schedule modal
    PlaceAutocomplete.tsx     # Google Maps place search
    ThemeProvider.tsx   # Dark mode provider
    TimeFieldInput.tsx  # 24-hour time input (HH:MM)
  lib/
    db.ts              # Database abstraction layer
    db-local.ts        # SQLite implementation (local dev)
    db-supabase.ts     # Supabase implementation (production)
    types.ts           # TypeScript type definitions
    routes.ts          # Google Routes API client
    supabase.ts        # Supabase client
```

---

## License

MIT
