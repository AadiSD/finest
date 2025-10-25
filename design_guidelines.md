# Design Guidelines: Finest Hospitality Event Management Portfolio

## Design Approach: Reference-Based (Luxury Hospitality)

Drawing inspiration from premium hospitality brands (Airbnb Experiences, Four Seasons, luxury event venues) with emphasis on visual storytelling and elegant simplicity. The design should exude sophistication while maintaining accessibility for both potential clients and administrative users.

---

## Typography System

**Primary Font**: Playfair Display (serif) for headings - conveys elegance and premium quality
**Secondary Font**: Inter (sans-serif) for body text - ensures readability and modern professionalism

**Hierarchy**:
- Hero Headlines: text-6xl md:text-7xl lg:text-8xl, font-bold, leading-tight
- Section Headers: text-4xl md:text-5xl, font-semibold
- Subsection Titles: text-2xl md:text-3xl, font-medium
- Card Titles: text-xl md:text-2xl, font-semibold
- Body Text: text-base md:text-lg, leading-relaxed
- Captions/Meta: text-sm, tracking-wide, uppercase for event categories

---

## Layout & Spacing System

**Spacing Primitives**: Tailwind units of 4, 8, 12, 16, 20, 24, 32 for consistency
- Section padding: py-20 md:py-32
- Container spacing: px-6 md:px-12 lg:px-20
- Card gaps: gap-8 md:gap-12
- Element spacing: mb-4, mb-8, mb-12 for vertical rhythm

**Container Strategy**:
- Full-width hero: w-full
- Content sections: max-w-7xl mx-auto
- Text-heavy areas: max-w-4xl mx-auto
- Form containers: max-w-2xl mx-auto

---

## Page Structure & Sections

### Homepage (Viewer Experience)

**Hero Section** (h-screen):
- Full-viewport background image showcasing premium event
- Centered content with company logo/name
- Tagline: "Crafting Unforgettable Experiences"
- Primary CTA: "Explore Our Portfolio" + Secondary: "Get in Touch"
- Subtle scroll indicator at bottom

**Company Overview** (py-24):
- Two-column layout: left text (max-w-xl), right stats grid
- Brief description of Finest Hospitality's expertise
- Key metrics: "500+ Events", "10 Years Excellence", "98% Client Satisfaction"

**Featured Events Showcase** (py-32):
- Masonry grid layout (3 columns desktop, 2 tablet, 1 mobile)
- Large format event cards with image, event type badge, title, brief description
- Hover effect: subtle scale transform and overlay reveal
- "View All Portfolio" link at bottom

**Services Section** (py-24):
- Four-column grid (responsive: 1-2-4 columns)
- Service cards: Weddings, Corporate Events, Private Parties, Destination Events
- Icon + title + description format
- Each card links to filtered portfolio view

**Testimonials** (py-20):
- Three-column grid featuring client quotes
- Client name, event type, event date
- Elegant quotation marks as design element

**Contact Preview** (py-24):
- Split layout: left CTA text, right mini contact form
- Fields: Name, Email, Event Type, Brief Message
- Prominent "Send Inquiry" button

**Footer** (py-16):
- Multi-column: Company Info | Quick Links | Services | Contact Details
- Social media icons
- Newsletter signup
- Copyright and credentials

### Portfolio Gallery Page

**Filter Bar** (sticky, top-0):
- Horizontal pill buttons: All, Weddings, Corporate, Private, Destination
- Active state clearly distinguished

**Portfolio Grid** (py-20):
- Responsive masonry layout with varied image heights
- Each card: high-quality event image, event category badge, title, date, location
- Click to open full event detail modal/page

**Event Detail Modal/Page**:
- Full-screen gallery carousel at top
- Event metadata: date, location, guest count, event type
- Detailed description and highlights
- Additional image grid below
- Related events suggestions at bottom

### Admin Dashboard (Post-Login)

**Dashboard Layout**:
- Left sidebar navigation: Dashboard, Events, Inquiries, Settings, Logout
- Main content area with top header bar showing admin name and profile

**Events Management**:
- Table view with event thumbnails, titles, dates, status
- Quick actions: Edit, Delete, Feature
- "Add New Event" prominent button
- Drag-to-reorder for featured events

**Inquiries Management**:
- List view of contact form submissions
- Filters: New, Read, Archived
- Click to expand full message with client details
- Mark as Read/Archived actions

### Login/Auth Pages

**Login Page**:
- Centered card (max-w-md) on subtle background
- Finest Hospitality logo at top
- Role selector: Viewer / Admin tabs
- Replit Auth integration buttons
- Clean, minimal design focusing on authentication flow

---

## Component Specifications

**Event Cards**:
- Aspect ratio: 4:5 for portrait, 16:9 for landscape
- Image with subtle gradient overlay at bottom
- Title and metadata positioned at card bottom
- Rounded corners: rounded-lg
- Shadow: shadow-lg hover:shadow-2xl transition

**Form Elements**:
- Inputs: p-4, rounded-md, border-2 focus states
- Labels: text-sm font-medium mb-2
- Textarea: min-h-[120px]
- Submit buttons: full-width on mobile, auto on desktop

**Navigation**:
- Desktop: horizontal menu with logo left, links center, CTA button right
- Mobile: hamburger menu with slide-in drawer
- Sticky on scroll with backdrop blur effect

**Animations** (Subtle & Purposeful):
- Hero: fade-in content on load (0.8s ease)
- Scroll reveal: sections fade-up as they enter viewport
- Image hover: scale(1.05) transform with 0.3s transition
- Card interactions: subtle elevation changes
- NO distracting continuous animations or parallax effects

---

## Images Section

**Hero Image**: 
Full-width, high-quality photograph of an elegantly decorated event venue (wedding reception or gala setup) with sophisticated lighting, floral arrangements, and table settings. Image should convey luxury and attention to detail.

**Featured Events**: 
6-8 professional event photographs showcasing variety:
- Outdoor wedding ceremony
- Corporate gala dinner
- Intimate private party
- Destination event
- Detail shots (table settings, decorations)
- Candid celebration moments

**Services Section Icons**: 
Use Heroicons for service type indicators (cake for weddings, briefcase for corporate, gift for private parties, airplane for destination)

**About/Team**: 
Professional team photo showing Finest Hospitality staff in event setting, plus 2-3 images of team members working at events

**All images should be high-resolution, professionally shot, and consistently edited with warm, inviting tones**

---

## Responsive Behavior

- Mobile-first approach with strategic breakpoints (md: 768px, lg: 1024px, xl: 1280px)
- Hero text scales dramatically: 40px → 64px → 96px
- Grid columns collapse gracefully: 4→2→1 or 3→2→1
- Navigation transforms to hamburger menu below 768px
- Form layouts stack vertically on mobile
- Touch-friendly button sizes (min-height: 48px) on mobile

---

## Accessibility Standards

- Semantic HTML throughout (header, nav, main, section, footer)
- ARIA labels for interactive elements and navigation
- Focus indicators visible and distinct
- Sufficient contrast ratios for all text
- Alt text for all images describing event scenes
- Keyboard navigation support for all interactive elements
- Form validation with clear error messaging