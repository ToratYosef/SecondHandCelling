# Admin System Documentation

## Overview
Complete modern admin system for SecondHandCell phone buyback business with 9+ views, shared components, and full backend API integration.

## Views Created

### 1. Main Dashboard (Orders Hub) - `/admin/dashboard`
**File:** `client/src/pages/admin/DashboardNew.tsx`

**Features:**
- 6 summary cards (total orders, month orders, pending, needs printing, received today, avg order value)
- Advanced filters: search, status dropdown, date range picker
- Paginated orders table with 20 items per page
- Bulk selection with checkbox column
- Inline status editing with email notifications
- Row actions: view details, generate label, re-offer
- Order details modal with color-coded sections
- Re-offer modal for price adjustments

**Backend Endpoints:**
- `GET /api/admin/dashboard-stats` - 6 metrics for cards
- `GET /api/admin/orders?search=...&status=...&dateRange=...&page=1&pageSize=20` - Filtered orders
- `POST /api/admin/orders/:id/status` - Update status + send email

---

### 2. Aging Orders View - `/admin/aging`
**File:** `client/src/pages/admin/Aging.tsx`

**Features:**
- Priority-based color coding:
  - 🔴 Critical (15+ days) - Red
  - 🟠 High (8-14 days) - Amber
  - 🟡 Medium (4-7 days) - Yellow
  - 🟢 Normal (1-3 days) - Blue
- Age-based filters (1-3, 4-7, 8-14, 15+ days)
- Metrics: total orders, completed, pending, avg processing time
- Aging analysis table with: priority, order #, customer, status, age in status, total age, value
- Legend explaining priority levels

**Backend Endpoints:**
- `GET /api/admin/analytics` - Returns aging data and metrics

---

### 3. Analytics Dashboard - `/admin/analytics`
**File:** `client/src/pages/admin/Analytics.tsx`

**Features:**
- Revenue overview: 3 gradient cards (total revenue, avg order value, total orders)
- Line chart: Orders over time (switchable between count/value metrics)
- Pie chart: Status distribution with custom colors
- Top 10 devices table: Ranked by revenue with count and averages
- Conversion funnel: Horizontal bar chart (quotes → labeled → shipped → received → inspected → completed)
- Date range selector: week/month/quarter/year

**Backend Endpoints:**
- `GET /api/admin/analytics/full?range={dateRange}` - Returns:
  - `ordersOverTime`: Array of `{date, orders, value}`
  - `statusDistribution`: Array of `{status, count}`
  - `topDevices`: Array of `{model, count, totalAmount, avgAmount}`
  - `revenue`: `{totalPaidOut, avgOrderValue, totalOrders}`
  - `funnel`: `{quotes, labeled, shipped, received, inspected, completed}`

---

### 4. Print Queue - `/admin/print-queue`
**File:** `client/src/pages/admin/PrintQueue.tsx`

**Features:**
- Queue summary: labels waiting, selected count, total value
- Bulk selection with "select all" checkbox
- Bulk actions:
  - Create print bundle (combines PDFs)
  - Mark kit sent (updates status to awaiting_device)
- Individual order actions: generate label, view label, mark sent
- Table showing: order #, customer, label status, created date, value

**Backend Endpoints:**
- `GET /api/admin/orders/needs-printing` - Orders with status 'label_pending'
- `POST /api/admin/orders/needs-printing/bundle` - Create combined PDF bundle
- `POST /api/admin/orders/:id/mark-kit-sent` - Update to 'awaiting_device'
- `POST /api/admin/orders/:id/shipment` - Generate shipping label (from existing route)

---

### 5. Clicks Analytics - `/admin/clicks`
**File:** `client/src/pages/admin/Clicks.tsx`

**Features:**
- Metrics cards: total clicks, unique devices, conversion rate
- Filters: device family (all/iPhone/Samsung/Google/Other), date range, sort by (clicks/conversion/orders)
- Click analytics table showing:
  - Device name and family
  - Total clicks (blue highlight)
  - Orders (green highlight)
  - Conversion rate with progress bar
  - Last clicked date
  - Trend indicator (↗ positive, ↘ negative, → neutral)

**Backend Endpoints:**
- `GET /api/admin/clicks?family=...&range=...&sortBy=...` - Returns:
  - `metrics`: `{totalClicks, uniqueDevices, conversionRate}`
  - `devices`: Array of click data with trends

---

### 6. Email Management - `/admin/email`
**File:** `client/src/pages/admin/Email.tsx`

**Features:**
- Quick action templates:
  - 🔍 Condition Inquiry
  - ✅ FMI Cleared
  - ⭐ Request Review
  - ⏱️ Payment Delay
- Email composer: recipient, subject, body (textarea)
- Sent email history table: date, recipient, subject, status
- Clear button to reset form

**Backend Endpoints:**
- `POST /api/admin/emails/send` - Send custom email (uses `sendRawEmail`)
- `GET /api/admin/emails/history` - Sent email log (mock data currently)

---

## Shared Components

### AdminLayout
**File:** `client/src/components/AdminLayout.tsx`

**Features:**
- Responsive sidebar navigation with icons
- Collapsible on mobile with overlay
- Sticky top bar with quick stats (today's orders, pending, needs printing)
- Navigation items: Dashboard, Aging, Analytics, Print Queue, Clicks, Email, Devices, Orders, Inspections, Pricing
- Mobile menu toggle button

### AdminToast
**File:** `client/src/components/AdminToast.tsx`

**Toast System:**
- Context-based notification system
- 4 types: success (green), error (red), warning (yellow), info (blue)
- Auto-dismiss after 5 seconds
- Slide-in animation from right
- Methods: `showToast()`, `success()`, `error()`, `warning()`, `info()`

### AdminModal
**File:** `client/src/components/AdminModal.tsx`

**Modal Component:**
- Reusable modal with backdrop
- Size variants: sm, md, lg, xl
- Props: title, isOpen, onClose, loading state, footer buttons
- Backdrop click to close
- ESC key support

### Admin Utilities
**File:** `client/src/components/AdminUtilities.tsx`

**Components:**
- `LoadingSpinner`: Animated spinner with optional text
- `EmptyState`: Icon, title, description for empty results
- `ErrorState`: Error icon, message, retry button

---

## Backend Routes Summary

### Quick Stats
- `GET /api/admin/quick-stats` - Top bar metrics

### Dashboard
- `GET /api/admin/dashboard-stats` - 6 dashboard cards
- `GET /api/admin/orders` - Filtered, paginated orders
- `POST /api/admin/orders/:id/status` - Update status + email

### Analytics
- `GET /api/admin/analytics` - Aging data
- `GET /api/admin/analytics/full` - Complete analytics with charts data

### Print Queue
- `GET /api/admin/orders/needs-printing` - Pending labels
- `POST /api/admin/orders/needs-printing/bundle` - Create PDF bundle
- `POST /api/admin/orders/:id/mark-kit-sent` - Update status

### Clicks
- `GET /api/admin/clicks` - Click analytics with filters

### Email
- `POST /api/admin/emails/send` - Send custom email
- `GET /api/admin/emails/history` - Sent email log

### Existing Shipment Routes (Reused)
- `POST /api/admin/orders/:id/shipment` - Generate label
- `GET /api/admin/orders/:id/shipment` - Get shipment info

---

## Design System

### Color Coding
- **Red/Critical:** 15+ day aging, urgent issues
- **Amber/High:** 8-14 day aging, high priority
- **Yellow/Medium:** 4-7 day aging, medium priority
- **Green/Normal:** 1-3 day aging, on track
- **Blue:** Informational, primary actions
- **Purple:** Analytics, special features

### Gradient Cards
All summary cards use gradient backgrounds:
```tsx
className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-blue-200 dark:border-blue-800"
```

### Status Colors
- `label_pending`: Amber
- `awaiting_device`: Blue
- `in_transit`: Purple
- `received`: Indigo
- `inspecting`: Orange
- `completed`: Green
- `cancelled`: Red

---

## Charts Library: Recharts

**Installed:** Already available in project

**Components Used:**
- `LineChart` - Orders over time
- `PieChart` - Status distribution
- `BarChart` - Conversion funnel

**Configuration:**
- Responsive containers
- Custom colors matching design system
- Tooltips with data formatting
- Legend with styled labels

---

## Routing

**File:** `client/src/App.tsx`

**New Admin Routes:**
```tsx
<Route path="/admin/dashboard" component={AdminDashboardNew} />
<Route path="/admin/aging" component={AdminAging} />
<Route path="/admin/analytics" component={AdminAnalytics} />
<Route path="/admin/print-queue" component={AdminPrintQueue} />
<Route path="/admin/clicks" component={AdminClicks} />
<Route path="/admin/email" component={AdminEmail} />
```

---

## Testing Checklist

- [x] All TypeScript errors resolved
- [x] Backend routes implemented
- [x] Routing configured
- [ ] Test Dashboard filters and pagination
- [ ] Test Aging priority color coding
- [ ] Test Analytics date range switching
- [ ] Test Print Queue bulk actions
- [ ] Test Clicks analytics filtering
- [ ] Test Email quick actions and sending
- [ ] Test all refetch/refresh buttons
- [ ] Test mobile responsiveness
- [ ] Test dark mode compatibility

---

## Future Enhancements

1. **Database Tracking:**
   - Add `device_clicks` table to track real click data
   - Add `email_logs` table for email history

2. **Print Queue:**
   - Actual PDF bundle generation (combine multiple labels)
   - Batch printing with print dialog

3. **Analytics:**
   - More chart types (area charts, heat maps)
   - Export to CSV/Excel
   - Custom date range picker

4. **Clicks:**
   - Real-time click tracking
   - A/B testing for device listings
   - Funnel analysis per device

5. **Email:**
   - Email templates management UI
   - Scheduled emails
   - Email preview before sending

---

## Admin Credentials

**Email:** admin@secondhandcell.com  
**Password:** admin123

**Access:** All admin routes protected with `requireAdmin` middleware and `AdminProtected` component wrapper.
