# Finest Hospitality - Event Management Portfolio

## Overview
Professional event management portfolio website for Finest Hospitality company. Built with React, Node.js, Express, and PostgreSQL with Replit Auth integration.

## Recent Changes (October 25, 2025)
- Created complete MVP with landing page, portfolio gallery, admin dashboard
- Implemented Replit Auth with role-based access (admin/viewer)
- Added dark mode with ThemeProvider and theme toggle
- Seeded database with 6 sample events
- Created admin promotion script for user management
- Fixed navigation to use Wouter (SPA routing) instead of window.location
- Generated professional event images using AI

## User Roles & Authentication
- **Viewer (Default)**: All authenticated users start as viewers
  - Can view landing page and portfolio
  - Can submit contact inquiries
- **Admin**: Must be manually promoted using admin-seed script
  - Full event CRUD operations
  - View and manage contact inquiries
  - Access to admin dashboard

### Admin Setup Process
1. User logs in via `/api/login` (Replit Auth)
2. Run: `npx tsx server/admin-seed.ts user@email.com`
3. User logs out and back in to access admin dashboard

## Project Architecture

### Database Schema
- **users**: Replit Auth users with isAdmin flag
- **sessions**: Replit Auth session storage
- **events**: Portfolio events (title, description, category, image, featured flag)
- **inquiries**: Contact form submissions with read status

### Key Routes
**Public:**
- `/` - Landing page (or Admin Dashboard if admin)
- `/portfolio` - Event portfolio with filtering
- `/api/login` - Replit Auth login
- `/api/logout` - Logout

**API Endpoints:**
- Public: GET /api/events, GET /api/events/featured, POST /api/inquiries
- Authenticated: GET /api/auth/user
- Admin-only: Events CRUD, GET /api/inquiries, PATCH /api/inquiries/:id/read

### Tech Stack
- Frontend: React, TypeScript, TailwindCSS, Shadcn UI, Wouter, TanStack Query
- Backend: Express, Drizzle ORM, Replit Auth (OpenID Connect)
- Database: PostgreSQL (Neon)
- Images: AI-generated event photos in attached_assets/

## Design System
- Primary Color: #ED7D3A (luxury orange)
- Typography: Playfair Display (headings), Inter (body)
- Dark mode support with ThemeProvider
- Responsive mobile-first design
- Follows design_guidelines.md specifications

## Development Commands
- `npm run dev` - Start development server (already configured in workflow)
- `npm run db:push` - Push schema changes to database
- `npx tsx server/seed.ts` - Seed sample events
- `npx tsx server/admin-seed.ts <email>` - Promote user to admin

## Important Files
- `shared/schema.ts` - Database schema and TypeScript types
- `server/storage.ts` - Database operations (DatabaseStorage)
- `server/routes.ts` - API endpoints with auth middleware
- `server/replitAuth.ts` - Replit Auth integration
- `client/src/pages/` - React page components
- `design_guidelines.md` - Visual design specifications

## Notes for Future Development
- All users default to viewer role - must manually promote to admin
- Theme preference persisted in localStorage as "finest-hospitality-theme"
- Using Wouter for SPA routing (not window.location)
- All navigation should use `Link` component from wouter
- Admin dashboard accessible only to users with isAdmin=true
- Contact forms save to database (inquiries table)
- Featured events appear on landing page (isFeatured flag)
