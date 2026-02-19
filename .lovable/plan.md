

# TekMeals Company Admin Dashboard

A comprehensive corporate food ordering platform dashboard built with React, TypeScript, and Tailwind CSS. Features a modern corporate design with an Orange/Amber brand identity and a service layer ready for your existing API integration.

---

## 🎨 Design System & Branding

- **Primary Color**: Warm Orange/Amber palette (#F97316 / amber-500 tones)
- **Style**: Modern Corporate - professional cards, clear visual hierarchy, subtle shadows
- **Typography**: Clean, readable fonts with proper sizing hierarchy
- **Components**: Using shadcn/ui for consistent, accessible UI elements

---

## 📐 Layout Structure

### Sidebar Navigation (Left)
- Collapsible sidebar with logo and navigation
- Organized sections: Dashboard, Orders, Employees, Products, Billing, Reports, Settings
- Bottom profile dropdown with Profile, Change Password, Logout options
- Logout confirmation modal

### Top Bar
- Page title and breadcrumbs
- Quick actions area
- Notifications icon
- User avatar

---

## 📊 Module 1: Dashboard

**KPI Cards:**
- Today's Orders (with trend indicator)
- Monthly Orders (with comparison)
- Active Employees (total count)
- Pending Invoices (amount due)

**Charts:**
- Orders Trend (line chart - last 30 days)
- City-wise Distribution (pie/donut chart)

---

## 📋 Module 2: Orders

**Unified Order Management with tabs:**
- All Orders | Today's Orders | Custom Orders | Company Orders

**Filters:**
- Date range picker
- Employee selector
- City dropdown
- Order type filter
- Search bar

**Order Table:**
- Columns: Employee, City, Items, Quantity, Date, Status, Actions
- Status badges (Pending, Confirmed, Delivered, Cancelled)
- Click to view order details modal

---

## 👥 Module 3: Employees

**Features:**
- Employee list with search and filters
- Add new employee form (Name, Email, Phone, City, Meal Types)
- Bulk import via CSV/XLSX upload
- Export employee data
- Status toggle (Active/Inactive)

---

## 🍽️ Module 4: Products (Read-Only)

**Features:**
- City-wise menu browsing
- Category filters (Breakfast, Lunch, Dinner, Snacks)
- Product cards with images, names, and prices
- No edit capabilities (view-only for company admins)

---

## 💳 Module 5: Billing

**Features:**
- Invoice list with pagination
- Invoice details modal
- Download PDF/Excel invoices
- Payment summary cards
- Status indicators (Paid, Pending, Overdue)

---

## 📈 Module 6: Reports

**Available Reports:**
- Orders Report (with date range)
- Employee Consumption Analysis
- City Usage Statistics
- Meal Trends
- Export to CSV/Excel functionality

---

## ⚙️ Module 7: Settings

**Sections:**
- Company Profile (name, logo upload, description)
- Contact Information
- Security Settings (change password)
- Notification Preferences

---

## 🛠️ Technical Architecture

```
src/
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── TopBar.tsx
│   │   ├── DashboardLayout.tsx
│   │   └── ProfileDropdown.tsx
│   ├── dashboard/
│   ├── orders/
│   ├── employees/
│   ├── products/
│   ├── billing/
│   ├── reports/
│   └── settings/
├── pages/
│   ├── Dashboard.tsx
│   ├── Orders.tsx
│   ├── Employees.tsx
│   ├── Products.tsx
│   ├── Billing.tsx
│   ├── Reports.tsx
│   └── Settings.tsx
├── services/
│   └── api/
│       ├── client.ts
│       ├── dashboardApi.ts
│       ├── ordersApi.ts
│       ├── employeesApi.ts
│       ├── productsApi.ts
│       ├── billingApi.ts
│       ├── reportsApi.ts
│       └── settingsApi.ts
├── hooks/
│   ├── useDashboard.ts
│   ├── useOrders.ts
│   ├── useEmployees.ts
│   └── ...
├── types/
│   ├── auth.ts
│   ├── order.ts
│   ├── employee.ts
│   ├── product.ts
│   ├── billing.ts
│   └── ...
└── lib/
    └── utils.ts
```

---

## ✨ UX Features

- **Loading States**: Skeleton loaders for all data-heavy components
- **Empty States**: Friendly illustrations and messages when no data
- **Error Handling**: Toast notifications for errors and success messages
- **Responsive Design**: Fully responsive for tablet and desktop
- **Accessibility**: Proper ARIA labels and keyboard navigation

---

## 🔌 API Service Layer

Each service file will include typed stub functions ready for your API integration:

```typescript
// Example: ordersApi.ts
export const ordersApi = {
  getAll: async (filters: OrderFilters): Promise<Order[]> => {
    // TODO: Replace with actual API call
    // return fetch('/api/orders', { ... })
  },
  getById: async (id: string): Promise<Order> => { ... },
  // ...
}
```

This gives you full TypeScript types and a clear structure to connect your existing backend.

