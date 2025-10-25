# Finest Hospitality - Event Management Portfolio

## Overview
Professional event management portfolio website for Finest Hospitality company. A simplified, public-facing site showcasing event portfolios with contact form functionality.

## Recent Changes (October 25, 2025)
- **Removed database dependency** - Now uses in-memory storage for faster performance
- **Removed authentication** - Simplified to public-only pages
- **Removed admin dashboard** - Portfolio is managed via code/data updates
- **Contact form logs to console** - Inquiries are logged (ready for email integration)
- **Added professional event images** - 12 high-quality stock images for portfolio events
- **Simplified architecture** - Landing page, portfolio, and contact form only

## Current Architecture

### Pages
- **Landing Page** (`/`) - Hero section, company overview, services, featured events, contact form
- **Portfolio** (`/portfolio`) - Full event gallery with category filtering
- **404 Page** - Custom not found page

### Data Storage
- **In-Memory Events** - 12 pre-configured events with categories:
  - Wedding events
  - Corporate events
  - Destination weddings
  - Private celebrations
- **No Database** - All event data stored in `server/storage.ts`

### Contact Form
- Validates user input (name, email, event type, message)
- Currently **logs inquiries to console**
- Ready for email integration using Resend connector:
  1. Set up Resend connector in integrations
  2. Add email sending logic to `server/routes.ts`
  3. Configure admin email recipient

### Event Categories
- `wedding` - Traditional and luxury Indian weddings
- `corporate` - Business events, conferences, galas
- `destination` - Destination wedding celebrations
- `private` - Personal celebrations and functions

## Tech Stack
- **Frontend**: React, TypeScript, TailwindCSS, Shadcn UI, Wouter, TanStack Query
- **Backend**: Express, Node.js
- **Styling**: Custom theme with Playfair Display & Inter fonts
- **Images**: Professional stock photos in `attached_assets/stock_images/`

## Design System
- **Primary Color**: #ED7D3A (luxury orange)
- **Typography**: Playfair Display (headings), Inter (body)
- **Dark Mode**: Full support via ThemeProvider
- **Layout**: Responsive, mobile-first design

## Development
- **Start**: `npm run dev` (auto-configured in workflow)
- **Port**: 5000 (frontend + backend)

## Key Files
- `shared/schema.ts` - TypeScript types for Event and Inquiry
- `server/storage.ts` - In-memory data store with event catalog
- `server/routes.ts` - API endpoints (events, inquiries)
- `client/src/pages/landing.tsx` - Landing page with contact form
- `client/src/pages/portfolio.tsx` - Event portfolio gallery

## Adding Email Integration (Optional)
To send contact form submissions via email:

1. Use Resend integration (already discovered):
   ```
   connector:ccfg_resend_01K69QKYK789WN202XSE3QS17V
   ```

2. Update `server/routes.ts` inquiry endpoint to send email

3. Configure admin email recipient

## Event Images
All events use professional stock images located in:
- `attached_assets/stock_images/`
- Served via static file serving
- Referenced in event data as `/attached_assets/stock_images/[filename].jpg`

## Notes for Future Development
- No authentication required - fully public site
- Events are hardcoded in storage - update `server/storage.ts` to add/modify events
- Contact forms log to console - check server logs for inquiries
- Theme persisted in localStorage as "finest-hospitality-theme"
- All navigation uses Wouter `Link` component for SPA routing
