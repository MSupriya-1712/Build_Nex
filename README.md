# BuildNex – Smart Construction Management Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite_5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

A modern, full-stack, enterprise-grade Construction Management Platform built with **React**, **TypeScript**, **Tailwind CSS**, **Node.js**, **Express**, **MongoDB/Mongoose**, and **Recharts**.

BuildNex enables general contractors, real estate developers, and civil engineering project directors to monitor job site progress in real time, control multi-million dollar budgets, manage materials inventory with low-stock alerts, track client property sales, and collaborate using an intelligent **BuildNex AI Construction Copilot**.

---

## 🏗️ Core Modules & Features

### 1. Executive Dashboard (`/`)
- **Key Performance Indicators (KPIs):** Active Projects, Under Construction, Completed, Total Budget, Total Expenses, and Overall Physical Completion percentage.
- **Analytics Visualizations:**
  - Monthly Expenditure vs Budget Limit bar chart (Recharts).
  - Portfolio Status Mix (In Progress, Completed, Planning, On Hold) donut chart.
  - Project Progress Bars comparing completion percentage with spent budget.
- **Action Streams:** Upcoming milestone deadlines and recent site field activities.

### 2. Project Management (`/projects`)
- Comprehensive project cards displaying code, name, sector, location, project manager, start/completion dates, budget, and live completion slider.
- Search, filter by status (Planning, In Progress, On Hold, Completed), and filter by sector (Residential, Commercial, Infrastructure, Industrial).
- Sorting by Completion %, Budget size, or Name.
- Full **CRUD**: Add Project modal, Edit Project modal, and Delete with destructive action confirmation dialog.

### 3. Detailed Project Page (`/projects/:id`)
- Deep-dive project overview with high-resolution site photo cover.
- Construction Milestones Tracker with percentage weights and status toggles.
- Assigned Personnel cards (Lead Manager, Structural Head, Safety Inspector).
- Site Field Logs and tasks linked directly to the project.

### 4. Construction Progress Tracking (`/progress`)
- Real-time field log feed documenting daily concrete pours, steel fixing, and facade installations.
- Log new progress updates with: Project, Work Completed, Cumulative Completion %, Date, Description, Weather Conditions, On-Site Labor Count, and Site Photo Attachment.
- Auto-syncs site percentage completion with the main project record.

### 5. Finance & Budgeting (`/finance`)
- Capital expenditure control: Total Allocated Budget, Amount Spent, and Remaining Capital Reserve.
- Breakdown of expenses by category (Materials, Labor, Equipment, Transport, Miscellaneous) with an interactive donut chart.
- Monthly cash flow burn rate bar chart.
- Expense ledger table with invoice numbers, vendor names, approval status, and Add/Edit/Delete expense dialogs.

### 6. Material Inventory & Warehouse (`/inventory`)
- Track construction inventory: Rebar, Cement bags, Sand aggregates, CPVC piping, Electrical conduits, and Safety gear.
- **Automated Low-Stock Warning Banner**: Highlights items where current stock is below safety thresholds.
- Add/Edit/Delete stock items with custom unit of measure, unit price, storage yard location, and vendor contacts.

### 7. Customer CRM & Property Buyers (`/customers`)
- Client profile management for home buyers, commercial tenants, and investors.
- Track assigned project, allocated unit (e.g., *Tower A - Penthouse 3101*), booking status (Lead, Booked, Agreement Signed, Handed Over), and payment escrow status (Pending, Partially Paid, Completed).
- Add/Edit/Delete customer profiles with contact numbers, email, and bespoke architectural customization requests.

### 8. Property Bookings & Sales Inventory (`/bookings`)
- Visual property cards with high-resolution architectural imagery.
- Unit specifications: square footage, bedrooms, bathrooms, and floor level.
- Filter by status (**Available**, **Reserved**, **Sold**) and property type (Apartment, Villa, Penthouse, Commercial, Studio).
- One-click **Reserve Unit** modal to quickly bind a prospective customer.

### 9. Construction Task Board (`/tasks`)
- 3-column Kanban workflow board: **To Do**, **In Progress**, **Completed**.
- Priority badges: **Urgent**, **High**, **Medium**, **Low**.
- Quick arrow buttons to move tasks between stages.
- Filter by project and priority; modal to add and edit tasks with due dates.

### 10. Executive Reports & Analytics (`/reports`)
- Portfolio-wide audit reports with printable layout (`window.print()`) and CSV export.
- Planned vs. Actual cash burn line graph.
- Budget vs. Actual spend comparison chart across all active sites.
- Fiscal period filter (Q1, Q2, Q3, Q4, Full Fiscal Year).

### 11. BuildNex AI Assistant (`/ai-assistant`)
- Intelligent construction project assistant interface.
- Synthesizes real-time site data to answer questions regarding:
  - Budget status and expenditure variance.
  - Low-stock materials that require urgent purchase orders.
  - Site progress updates and concrete curing strength milestones.
  - Executive construction report generation.
- Interactive chat bubbles, typing indicators, suggested quick prompts, and clipboard copy.
- Pluggable architecture: works out of the box with an intelligent local domain engine, and connects seamlessly to OpenAI / Gemini via `OPENAI_API_KEY`.

### 12. Notification Center (`/notifications`)
- Live alerts categorized into: Warnings (low material stock), Deadlines (milestones due soon), Success (new bookings), and Budget Notices.
- Mark individual or all notifications as read, with direct navigation links.

### 13. Settings & Demo Controls (`/settings`)
- User Profile: PMP License Number, role, contact info.
- Company Licensing: Contractor legal entity, Class A registration, tax ID.
- Notification Preferences: Email alerts, low stock threshold triggers.
- **Recruiter Demo Controls**: One-click button to reset all projects, materials, tasks, and budgets back to pristine realistic seed data.

---

## ⚙️ Architecture & Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 18 with Vite 5 & TypeScript |
| **Styling** | Tailwind CSS with custom navy & slate palette |
| **Icons** | Lucide React |
| **Charts** | Recharts (Responsive bar, line, and pie charts) |
| **Routing** | React Router v6 |
| **Backend Runtime** | Node.js (v20+) & Express.js |
| **Database** | MongoDB with Mongoose ODM |
| **Persistence Engine** | **Dual-Engine**: Live MongoDB database + Instant in-memory/localStorage fallback |

### Dual-Engine Demo Mode
When MongoDB is active, BuildNex connects and persists to MongoDB. If MongoDB is offline or unconfigured, BuildNex seamlessly activates its **In-Memory & LocalStorage Demo Engine**. All CRUD operations (Projects, Tasks, Materials, Expenses, Bookings, Customers, Progress) work with 100% functionality, enabling seamless recruiter demonstrations without database setup hurdles.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or higher) and npm installed on your system.

### Option A: One-Click Launch (Windows)
Double-click `start-buildnex.bat` or run:
```powershell
.\start-buildnex.ps1
```

### Option B: Manual Terminal Execution

#### 1. Start the Backend API
```bash
cd backend
npm install
npm run build
npm start
```
The Express API will start on: **`http://localhost:5000/api`**

#### 2. Start the Frontend Client
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
Open your browser to: **`http://localhost:5173`**

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check & database connection status |
| `GET` | `/api/analytics/dashboard` | Aggregated KPIs, charts, and upcoming milestones |
| `GET` | `/api/projects` | Fetch all construction projects |
| `POST` | `/api/projects` | Create a new project |
| `GET` | `/api/projects/:id` | Fetch project details with milestones and team |
| `PUT` | `/api/projects/:id` | Update project parameters |
| `DELETE` | `/api/projects/:id` | Delete a project |
| `GET` | `/api/tasks` | Get tasks (filter by project/priority/status) |
| `POST` | `/api/tasks` | Create a new task |
| `PUT` | `/api/tasks/:id` | Update task or change Kanban stage |
| `DELETE` | `/api/tasks/:id` | Delete task |
| `GET` | `/api/expenses` | Get expenses (filter by category/project) |
| `POST` | `/api/expenses` | Log new expense |
| `GET` | `/api/materials` | Get inventory items & stock levels |
| `POST` | `/api/materials` | Add material to warehouse |
| `PUT` | `/api/materials/:id` | Update stock quantity |
| `GET` | `/api/customers` | Get customer CRM directory |
| `POST` | `/api/customers` | Add customer record |
| `GET` | `/api/bookings` | Get property units and reservation statuses |
| `POST` | `/api/bookings` | Register new property unit |
| `PUT` | `/api/bookings/:id` | Reserve or update unit |
| `GET` | `/api/progress` | Get timeline of site progress logs |
| `POST` | `/api/progress` | Post site progress update with photo |
| `POST` | `/api/ai/chat` | Query BuildNex AI Copilot |
| `POST` | `/api/demo/reset` | Reset sample data to default seed records |

---

## 📁 Project Structure

```
buildnex/
├── backend/
│   ├── src/
│   │   ├── config/             # DB & environment configuration
│   │   ├── controllers/        # Express route controllers
│   │   ├── data/               # Seed data & in-memory demo repository
│   │   ├── middleware/         # Error handlers & validation
│   │   ├── models/             # Mongoose schemas (Projects, Tasks, Materials, etc.)
│   │   ├── routes/             # REST route declarations
│   │   └── server.ts           # Express server entry point
│   ├── dist/                   # Compiled backend distribution
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/common/  # Modals, Toast, Badges, StatCards, ProgressBars
│   │   ├── context/            # Global AppContext & toast system
│   │   ├── layouts/            # Sidebar, TopNavbar, and MainLayout
│   │   ├── pages/              # All 13 application views
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Projects.tsx
│   │   │   ├── ProjectDetails.tsx
│   │   │   ├── ConstructionProgress.tsx
│   │   │   ├── FinanceBudget.tsx
│   │   │   ├── MaterialInventory.tsx
│   │   │   ├── CustomerManagement.tsx
│   │   │   ├── Bookings.tsx
│   │   │   ├── TaskBoard.tsx
│   │   │   ├── ReportsAnalytics.tsx
│   │   │   ├── AiAssistant.tsx
│   │   │   ├── Notifications.tsx
│   │   │   └── Settings.tsx
│   │   ├── services/           # Dual-engine API client & localStorage store
│   │   ├── types/              # TypeScript interfaces for all domain entities
│   │   ├── utils/              # Currency, date, and math formatters
│   │   ├── App.tsx             # React Router routing tree
│   │   ├── index.css           # Tailwind base styles
│   │   └── main.tsx            # React application entry point
│   ├── public/
│   ├── dist/                   # Production build assets
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
├── package.json                # Monorepo root scripts
├── start-buildnex.bat          # Windows one-click launcher
├── start-buildnex.ps1          # PowerShell one-click launcher
└── README.md                   # Comprehensive documentation
```

---

## 💼 Sample Login & Recruiter Demonstration Credentials

No registration is required to explore all features. If prompted or presenting to recruiters:
- **Director Account:** `marcus.v@buildnex.com`
- **Role:** Lead Project Director & PMP
- **Default Mode:** Standalone Demo Mode (with automatic live API toggle if backend is started)
- **Reset Button:** Available in **Settings** or the **Top Bar** dropdown to refresh realistic project metrics at any point.
#   B u i l d _ N e x  
 