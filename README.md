# Finest Hospitality - Event Management Portfolio

A professional event management portfolio website built with React, Node.js, Express, and PostgreSQL featuring Replit Auth integration.

## Features

- **Landing Page**: Stunning hero section, company overview, featured events showcase, services section, and contact form
- **Portfolio Gallery**: Filterable event portfolio with masonry grid layout
- **Admin Dashboard**: Complete event management system with CRUD operations and inquiry management
- **Authentication**: Secure login with Replit Auth supporting Google, GitHub, X, Apple, and email/password
- **Role-Based Access**: Admin and viewer roles with protected routes
- **Contact Forms**: Database-persisted inquiry submissions
- **Dark Mode**: Full dark mode support with theme toggle
- **Responsive Design**: Mobile-first design that works beautifully on all devices

## Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS, Shadcn UI, Wouter (routing), TanStack Query
- **Backend**: Express.js, Node.js, TypeScript
- **Database**: PostgreSQL (Neon), Drizzle ORM
- **Authentication**: Replit Auth (OpenID Connect)
- **Deployment**: Replit

## Setup Instructions

### 1. Install Dependencies

Dependencies are already installed via the Replit environment.

### 2. Database Setup

The PostgreSQL database is already configured. The schema has been pushed to the database.

### 3. Seed Sample Events

Sample events have been seeded into the database. To re-seed:

\`\`\`bash
npx tsx server/seed.ts
\`\`\`

### 4. Create Admin User

**Important**: By default, all users are viewers. To access the admin dashboard, you need to promote a user to admin.

#### Steps to Create an Admin:

1. First, log in to the website using the login button
2. After logging in once, run the admin promotion script with your email:

\`\`\`bash
npx tsx server/admin-seed.ts your-email@example.com
\`\`\`

3. Log out and log back in to see the admin dashboard

Example:
\`\`\`bash
npx tsx server/admin-seed.ts admin@example.com
\`\`\`

### 5. Run the Application

The application is already running. Visit the preview URL to see the website.

## User Roles

- **Viewer**: Can view the landing page, portfolio, and submit contact inquiries
- **Admin**: Full access to event management, inquiry viewing, and all viewer features

## Admin Dashboard Features

- **Event Management**: Create, edit, delete, and feature events
- **Inquiry Management**: View contact form submissions and mark as read
- **Analytics**: View total events, new inquiries, and featured events count

## API Endpoints

### Public Endpoints
- `GET /api/events` - Get all events
- `GET /api/events/featured` - Get featured events
- `POST /api/inquiries` - Submit a contact inquiry

### Protected Endpoints (Authenticated)
- `GET /api/auth/user` - Get current user

### Admin-Only Endpoints
- `POST /api/events` - Create a new event
- `PATCH /api/events/:id` - Update an event
- `DELETE /api/events/:id` - Delete an event
- `GET /api/inquiries` - Get all inquiries
- `PATCH /api/inquiries/:id/read` - Mark inquiry as read

## Development

- The application uses hot-reloading for development
- Dark mode is persisted in localStorage
- All forms include validation using Zod schemas
- Type safety across frontend and backend using shared TypeScript types

## Design

The website follows luxury hospitality design principles:
- Playfair Display (serif) for elegant headings
- Inter (sans-serif) for readable body text
- Warm color palette with primary color #ED7D3A (orange)
- Subtle animations and hover effects
- Professional event photography showcasing diverse event types

## Production Deployment

To publish the website:
1. Ensure all features are working correctly
2. Test admin functionality with a promoted admin user
3. Click the "Publish" button in Replit to deploy

### Render (free full-stack hosting)

This repo includes a full-stack Render deployment guide in `DEPLOY_RENDER.md`. The high-level steps are:

1. Create a **Web Service** on Render linked to this repo.
2. Set the build command to `npm ci && npm run build` and the start command to `npm start`.
3. Add required environment variables in Render:
   - `DATABASE_URL`
   - `SESSION_SECRET`
   - `NODE_ENV=production`
   - Any provider keys you use (SMTP/OAuth/etc.)

For more detail (including Render DB setup), follow the full guide in `DEPLOY_RENDER.md`.

## Support

For issues or questions, contact the development team or refer to the Replit documentation.
