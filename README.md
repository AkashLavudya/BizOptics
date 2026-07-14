# BizOptics — Business Opportunity Intelligence Platform

> AI-powered SaaS platform to identify and score businesses needing website development, workflow automation, and AI agent services.

---

## ✅ Build Status

| Layer | Status |
|-------|--------|
| Frontend TypeScript | ✅ 0 errors |
| Backend TypeScript | ✅ 0 errors |
| NestJS DI & Routes | ✅ All 74 routes mapped |
| Database connection | ⚠️ Requires PostgreSQL |

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React, Tailwind CSS, Shadcn UI, Zustand, TanStack Query |
| Backend | NestJS, Prisma ORM, Passport JWT |
| Database | PostgreSQL |
| Charts | Recharts |
| Email | Nodemailer |
| API Docs | Swagger (OpenAPI) |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** ≥ 18
- **PostgreSQL** ≥ 14
- **npm** ≥ 9

### 1. Clone & Install
```bash
git clone <repo-url>
cd business-opportunity-platform
npm install
```

### 2. Configure Environment

**Backend** (`apps/server/.env`):
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bizoptics
JWT_SECRET=your-secret-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
```

**Frontend** (`apps/web/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup
```bash
# Create the database
createdb bizoptics

# Run migrations
npm run prisma:migrate

# Generate Prisma client
npm run prisma:generate

# Seed demo data
npm run prisma:seed
```

### 4. Start Development Servers

**Terminal 1 — Backend (port 3001):**
```bash
cd apps/server
npm run start:dev
```

**Terminal 2 — Frontend (port 3000):**
```bash
cd apps/web
npm run dev
```

### 5. Open in Browser
- **App**: http://localhost:3000
- **API Docs (Swagger)**: http://localhost:3001/api/docs

---

## 🐳 Docker (Recommended for Full Stack)

```bash
# Start PostgreSQL + backend + frontend
docker-compose up -d

# Run migrations inside container
docker-compose exec server npx prisma migrate dev
docker-compose exec server npx prisma db seed
```

---

## 📁 Project Structure

```
business-opportunity-platform/
├── apps/
│   ├── server/                   # NestJS Backend (port 3001)
│   │   ├── src/
│   │   │   ├── auth/             # JWT auth, register, login, refresh
│   │   │   ├── business/         # Business CRUD + opportunity scoring
│   │   │   ├── search/           # Google Places search + history
│   │   │   ├── analysis/         # Website, automation & AI analysis
│   │   │   ├── recommendation/   # AI-generated action plans
│   │   │   ├── analytics/        # Dashboard KPIs & trends
│   │   │   ├── export/           # CSV, Excel, PDF export
│   │   │   ├── profile/          # User profile management
│   │   │   ├── admin/            # Admin panel + audit logs
│   │   │   ├── mail/             # Email templates (nodemailer)
│   │   │   └── prisma/           # Database service
│   │   └── prisma/
│   │       ├── schema.prisma     # Database schema
│   │       └── seed.ts           # Demo data seeder
│   └── web/                      # Next.js Frontend (port 3000)
│       └── src/
│           ├── app/
│           │   ├── (auth)/       # Login, Register, Forgot Password
│           │   └── (dashboard)/  # All dashboard pages
│           ├── components/
│           │   ├── ui/           # Shadcn-style components
│           │   └── landing/      # Homepage sections
│           ├── lib/              # API client, utilities
│           └── store/            # Zustand auth store
```

---

## 🔑 API Endpoints

| Module | Endpoints |
|--------|-----------|
| Auth | `POST /api/v1/auth/register`, `/login`, `/logout`, `/refresh`, `/forgot-password`, `/reset-password` |
| Business | `GET/DELETE /api/v1/businesses`, `GET /businesses/:id`, `POST /businesses/:id/analyze` |
| Search | `POST /api/v1/search`, `GET/DELETE /search/history/:id` |
| Analysis | `POST /api/v1/analysis/business/:id`, `GET /analysis/:id`, `POST /analysis/batch` |
| Recommendations | `GET /api/v1/recommendations/:id`, `PATCH /recommendations/:id/action` |
| Analytics | `GET /api/v1/analytics`, `/stats`, `/trends`, `/top-opportunities` |
| Export | `POST /api/v1/export`, `GET /export/csv`, `/excel`, `/pdf` |
| Profile | `GET/PUT /api/v1/profile`, `PATCH /profile/change-password` |
| Admin | `GET /api/v1/admin/stats`, `/users`, `/audit-logs` |

---

## 🌐 Dashboard Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with hero, features, pricing |
| `/login` | Authentication |
| `/register` | New account |
| `/dashboard` | KPI overview |
| `/businesses` | Business list with filters, bulk export |
| `/businesses/:id` | Business detail with score rings |
| `/search` | Google Places search + history |
| `/analytics` | Recharts insights & trends |
| `/recommendations` | Action plans with tracking |
| `/export` | Multi-format data export |
| `/settings` | Profile & password management |
| `/admin` | Admin user management & audit logs |

---

## 🔒 Default Demo Credentials (after seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@bizoptics.com | Admin@123! |
| Analyst | analyst@bizoptics.com | Analyst@123! |
| User | user@bizoptics.com | User@123! |
