# Finest Hospitality - Event Management Portfolio

## Overview
Professional event management portfolio website for Finest Hospitality company. A simplified, public-facing site showcasing event portfolios with contact form functionality.

## Recent Changes (October 25, 2025)
- **Removed database dependency** - Now uses in-memory storage for faster performance
- **Removed authentication** - Simplified to public-only pages
- **Removed admin dashboard** - Portfolio is managed via code/data updates
- **Contact form ready for email** - Inquiries will be sent to admin email (awaiting Resend API key)
- **Added professional event images** - Mix of stock and AI-generated images for portfolio
- **Simplified architecture** - Landing page, portfolio, and contact form only
- **Expanded portfolio** - Now showcasing 14 events with diverse imagery

## Current Architecture

### Pages
- **Landing Page** (`/`) - Hero section, company overview, services, featured events, contact form
- **Portfolio** (`/portfolio`) - Full event gallery with category filtering
- **404 Page** - Custom not found page

### Data Storage
- **In-Memory Events** - 14 pre-configured events with categories:
  - Wedding events (7 events)
  - Corporate events (4 events)
  - Destination weddings (2 events)
  - Private celebrations (3 events)
- **No Database** - All event data stored in `server/storage.ts`

### Contact Form
- Validates user input (name, email, event type, message)
- **Awaiting Resend API key** to send emails to admin
- Email integration ready to implement:
  1. User creating Resend account
  2. Will add RESEND_API_KEY secret
  3. Will add admin email sending logic to `server/routes.ts`

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

## Email Integration (In Progress)
User is setting up Resend account for contact form email notifications.

**Next Steps**:
1. User will provide RESEND_API_KEY
2. Add secret using `ask_secrets` tool
3. Update `server/routes.ts` to send email to admin when inquiry is submitted
4. Configure admin email recipient address

## Event Images
Portfolio events use a mix of professional images:
- **Stock images**: `attached_assets/stock_images/` (12 images)
- **Generated images**: `attached_assets/generated_images/` (6 images)
- All served via static file serving
- Referenced in event data with full paths

## Notes for Future Development
- No authentication required - fully public site
- Events are hardcoded in storage - update `server/storage.ts` to add/modify events
- Contact forms awaiting email integration - currently structured but not sending
- Theme persisted in localStorage as "finest-hospitality-theme"
- All navigation uses Wouter `Link` component for SPA routing
- Portfolio now features 14 events showcasing both stock and AI-generated imagery
