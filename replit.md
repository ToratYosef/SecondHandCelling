# SecondHandCell

## Overview

SecondHandCell is a device buyback platform that allows users to sell their phones, tablets, watches, and other electronics. The platform provides instant quotes, free shipping labels, device inspection workflows, and payout processing. It includes a public-facing quote builder and customer portal, plus an admin dashboard for managing pricing, inspections, and orders.

**Tech Stack:**
- Frontend: React 18 + TypeScript + Vite
- Styling: Tailwind CSS + shadcn/ui (New York variant)
- Backend: Express.js + TypeScript
- Database: PostgreSQL via Drizzle ORM (using Neon serverless)
- Authentication: Session-based with bcrypt password hashing
- Routing: Wouter (client-side)
- State Management: TanStack Query (React Query)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Component Organization:**
- `client/src/pages/` - Page-level components organized by route
  - Public pages: Home, Sell, QuoteBuilder, Track, HowItWorks, FAQ, etc.
  - Customer account pages: `/account/*`
  - Admin portal pages: `/admin/*`
- `client/src/components/` - Shared UI components
  - `ui/` - shadcn/ui primitives (Button, Card, Input, etc.)
  - Layout components: PublicHeader, PublicFooter, AdminSidebar, CustomerSidebar
  - Feature components: DeviceCard, StatusBadge
- Path aliases configured: `@/` points to `client/src/`, `@shared/` to `shared/`

**Styling System:**
- Tailwind CSS with custom design tokens in `client/src/index.css`
- Design guidelines emphasize Inter font, specific spacing primitives (4, 6, 8, 12, 16, 24), and commerce-focused clarity
- Custom CSS variables for theming (background, foreground, primary, etc.)
- Utility classes: `hover-elevate`, `active-elevate-2` for interaction feedback

**Client-Side Routing:**
- Uses Wouter for lightweight routing
- No layouts; each page imports its own header/footer
- Three route groups conceptually: public, customer account, admin

**State & Data Fetching:**
- TanStack Query for server state
- Custom `queryClient` with credentials-based auth
- API requests via custom `apiRequest` helper in `lib/queryClient.ts`

### Backend Architecture

**API Structure:**
- Express.js server in `server/index.ts`
- Routes defined in `server/routes.ts`
- RESTful endpoints under `/api/` prefix
- Session-based authentication using express-session with PostgreSQL store (connect-pg-simple)

**Authentication & Authorization:**
- Password hashing with bcrypt (10 salt rounds)
- Session middleware: `requireAuth` (any authenticated user), `requireAdmin` (admin/super_admin only)
- User roles: `customer`, `admin`, `super_admin`
- Registration endpoint prevents role escalation by hard-coding role to "customer"

**Database Layer:**
- Drizzle ORM with Neon serverless PostgreSQL driver
- Schema defined in `shared/schema.ts` (shared between client and server)
- Storage abstraction in `server/storage.ts` provides CRUD operations
- Database client setup in `server/db.ts`

**Key Database Entities:**
- Users (with roles, email verification, marketing opt-in)
- Device catalog: Brands → Models → Variants
- Buyback pricing: Condition profiles, pricing rules
- Quote system: QuoteRequests → QuoteLineItems
- Order system: SellOrders → SellOrderItems
- Supporting tables: Addresses, payout methods, support tickets, payments, FAQs

### Data Flow Patterns

**Quote Generation Flow:**
1. User selects device (brand/model/variant)
2. User answers condition questions (storage, carrier, physical condition, lock status)
3. Frontend calculates estimate based on pricing rules
4. User accepts quote → creates QuoteRequest with QuoteLineItems
5. Quote can be converted to SellOrder

**Order Processing Flow:**
1. Quote converted to SellOrder (status: `label_pending`)
2. Shipping label generated → status: `awaiting_device`
3. Device shipped → status: `in_transit`
4. Device received → status: `received` → `under_inspection`
5. If condition matches: status → `payout_pending` → `completed`
6. If condition mismatch: status → `reoffer_pending` → `customer_decision_pending`
7. Customer accepts/rejects re-offer or requests return

**Admin Workflows:**
- Manage device catalog and pricing rules
- Process inspections and create re-offers
- Track shipments and payouts
- Handle customer support tickets

### Design Patterns

**Schema Validation:**
- Zod schemas auto-generated from Drizzle tables via `drizzle-zod`
- Insert schemas used for API validation
- `zod-validation-error` for user-friendly error messages

**Error Handling:**
- API responses throw on non-OK status
- Custom error handling in `queryClient`
- 401 responses can either throw or return null (configurable)

**Code Sharing:**
- `shared/schema.ts` contains types and schemas used by both client and server
- TypeScript path aliases ensure clean imports

**Session Management:**
- Sessions stored in PostgreSQL (not in-memory)
- Session extended with custom `userId` field
- Credentials included in all fetch requests

## External Dependencies

**UI Component Library:**
- shadcn/ui (Radix UI primitives + Tailwind styling)
- Components configured in `components.json` with "new-york" style variant

**Database:**
- PostgreSQL (expected to be provisioned via `DATABASE_URL` environment variable)
- Neon serverless driver with WebSocket support (ws package)

**Development Tools:**
- Vite for build tooling and dev server
- TSX for TypeScript execution in development
- esbuild for server bundling in production
- Replit-specific plugins: runtime error overlay, cartographer, dev banner (dev only)

**Key Runtime Dependencies:**
- express (server framework)
- drizzle-orm (database ORM)
- @neondatabase/serverless (Postgres driver)
- bcryptjs (password hashing)
- express-session + connect-pg-simple (session management)
- wouter (client routing)
- @tanstack/react-query (data fetching)
- react-hook-form + zod (form validation)
- date-fns (date utilities)
- lucide-react (icons)

**Build & Scripts:**
- `npm run dev` - Development mode with tsx
- `npm run build` - Vite build + esbuild server bundle
- `npm run start` - Production server
- `npm run db:push` - Drizzle schema push to database

**Environment Requirements:**
- `DATABASE_URL` must be set (throws error if missing)
- `NODE_ENV` used to toggle production/development behaviors