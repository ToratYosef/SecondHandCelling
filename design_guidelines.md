# SecondHandCell Design Guidelines

## Design Approach

**System:** Tailwind CSS + shadcn/ui with commerce-focused customization inspired by Stripe's professional clarity and Apple's trade-in experience simplicity.

**Core Principle:** Build trust through clean professionalism, transparent pricing displays, and effortless quote-to-payout journey.

---

## Typography

**Font Families:**
- Primary: Inter (via Google Fonts) - All UI, body text, data displays
- Headings: Inter with tighter tracking for marketing headlines

**Type Scale:**
- H1 (Hero): text-5xl md:text-6xl font-bold tracking-tight
- H2 (Section): text-3xl md:text-4xl font-bold
- H3 (Subsection): text-2xl font-semibold
- H4 (Card titles): text-xl font-semibold
- Body: text-base leading-relaxed
- Small/Caption: text-sm text-muted-foreground
- Price displays: text-4xl font-bold tabular-nums

---

## Layout System

**Spacing Primitives:** Use Tailwind units of 4, 6, 8, 12, 16, 24 (e.g., p-4, gap-6, my-8, py-12, space-y-16, py-24)

**Container Strategy:**
- Marketing sections: max-w-7xl mx-auto px-4 md:px-6
- Content sections: max-w-6xl mx-auto
- Forms/wizards: max-w-2xl mx-auto
- Admin tables: max-w-full with horizontal scroll on mobile

**Grid Patterns:**
- Feature cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- Device catalog: grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4
- Dashboard stats: grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4

---

## Component Library

### Navigation
- **Header:** Sticky top bar with logo left, main nav center, "Get Offer" + "Track Order" CTA buttons right, mobile hamburger menu
- **Footer:** 4-column grid (Products, Company, Support, Legal) + newsletter signup, social icons, copyright row

### Marketing Pages
- **Hero Section:** 
  - Full-width with gradient background (subtle)
  - 2-column layout: Left 60% (headline, subheading, dual CTAs), Right 40% (device mockup image or floating card with sample offer)
  - Height: min-h-[600px] with proper vertical centering
  
- **How It Works:** Horizontal stepper with 4 numbered steps, icons above, short description below, connecting lines between

- **Feature Cards:** Card with icon (in circle bg), title, 2-3 line description, shadow-sm hover:shadow-md transition

- **Device Grid Cards:** Image top, model name, storage/color badges, "Up to $XXX" price prominent, arrow icon bottom right

- **Testimonial Cards:** Quote text, 5-star rating, customer name + device sold, subtle border

### Quote Builder Wizard
- **Progress Indicator:** Top of page, 4 steps (Specs → Condition → Details → Offer), visual progress bar
- **Step Panels:** White card with border, generous padding (p-8), title, subtitle, form fields with clear labels
- **Selection Buttons:** Grid of large clickable cards with radio indicators, border-2 on selected, hover states
- **Condition Questions:** Toggle switches or radio groups with helper text, icons for visual clarity
- **Offer Summary Card:** Sticky sidebar on desktop showing running total with price breakdown, prominent final offer with green accent

### Forms & Inputs
- Use shadcn/ui Form components throughout
- Label: font-medium mb-2
- Input/Select: border with focus:ring-2 focus:ring-primary
- Error states: border-red-500 with text-sm text-red-600 message below
- Required fields: asterisk in label

### Data Display
- **Order Cards:** Border card with status badge top-right, device info left, pricing right, action buttons bottom
- **Tables:** Striped rows, sticky header, sortable columns with icons, hover row highlighting
- **Status Badges:** Rounded-full px-3 py-1 with semantic colors (green=completed, blue=in-progress, yellow=pending, red=issue)
- **Pricing Breakdown:** Table format with dashed borders between sections, bold final total row

### Admin Portal
- **Sidebar:** Fixed left, 240px wide, logo top, nav items with icons, user profile bottom
- **Content Area:** ml-240 with breadcrumbs, page title, action buttons top-right, main content area
- **Filter Panels:** Collapsible sections with checkbox/select groups
- **Analytics Cards:** Stat card with large number, label below, trend indicator (↑/↓), sparkline if applicable

---

## Images

**Hero Section:** 
- Primary: Modern smartphone (iPhone/Samsung flagship) at 45° angle with screen showing SecondHandCell quote interface, floating above subtle gradient background
- Placement: Right side of hero, 600x700px area, object-fit: contain

**How It Works:**
- Icons for each step: Search icon, Lock/Shield icon, Shipping box icon, Dollar sign icon
- Style: Outline style, 64x64px in circular background

**Device Catalog:**
- Product images: Official device photos on white background, 300x300px minimum
- Hover: Subtle scale transform (scale-105)

**Testimonials:**
- Optional: Small circular avatars (if using real photos), otherwise use initials in colored circles

**Marketing Sections:**
- Trust badges: SSL, BBB, payment provider logos (Stripe, PayPal) in grayscale, 120x40px
- Optional feature section background: Abstract circuit board or tech pattern, very subtle opacity

---

## Key UI Patterns

**Quote Lock Timer:** Countdown display with clock icon, shown in offer summary and order tracking

**Re-offer Comparison:** Side-by-side table comparing original vs adjusted offer with difference highlighted

**Shipment Tracking:** Timeline component with status nodes, completed steps in green, current pulsing, future gray

**Multi-device Cart:** Each device as removable line item with thumbnail, condition summary, individual price

**Responsive Behavior:**
- Desktop: Multi-column layouts, sticky sidebars
- Tablet: 2-column grids, simplified nav
- Mobile: Single column, bottom nav for key actions, collapsible filters

**Interactive States:**
- Buttons: shadow-sm hover:shadow active:scale-95 transition
- Cards: hover:border-primary hover:shadow-md for clickable items
- Links: underline-offset-4 hover:underline for text links