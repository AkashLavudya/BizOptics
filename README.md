# 🔭 BizOptics — Business Opportunity Intelligence Platform

> AI-powered SaaS platform that discovers businesses needing website development, workflow automation, and AI agent services — across the **United States** 🇺🇸 and all **36 states & union territories of India** 🇮🇳.

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?logo=nestjs)](https://nestjs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791?logo=postgresql&logoColor=white)](https://postgresql.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)

---

## 📸 What is BizOptics?

BizOptics scans Google Places data to find local businesses that are underserved digitally — no website, low reviews, outdated info — and scores them as **high-value service leads**. Built for freelancers, agencies, and sales teams who want to identify and prioritise outreach intelligently.

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🔍 **Location-Based Scan** | Select Country → State → City, pick a business category, and scan for opportunities |
| 🇮🇳 **Full India Coverage** | All **28 states + 8 union territories** with major cities |
| 🇺🇸 **Full US Coverage** | All **50 US states** with major cities |
| 🎯 **Opportunity Scoring** | Rule-based engine scores businesses on 15 signals (website quality, review count, social presence, etc.) |
| 📊 **Analytics Dashboard** | KPI cards, trend charts (Recharts), and top opportunity tables |
| 💼 **Business Profiles** | Detailed view with score rings, signal breakdown, and AI-generated action plans |
| 📤 **Multi-format Export** | Export results as CSV, Excel, or PDF |
| 🔐 **JWT Auth** | Secure register/login with refresh tokens and 8h session lifetime |
| 👑 **Admin Panel** | User management, role control, and audit logs |
| 📬 **Email Notifications** | Nodemailer integration for password reset and welcome emails |
| 📖 **API Docs** | Full Swagger / OpenAPI documentation at `/api/docs` |

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, React 18, Tailwind CSS, Shadcn UI, Zustand, TanStack Query |
| **Backend** | NestJS 10, Prisma ORM, Passport JWT |
| **Database** | PostgreSQL 14+ |
| **Charts** | Recharts |
| **Email** | Nodemailer |
| **API Docs** | Swagger (OpenAPI 3) |
| **Monorepo** | npm workspaces |

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- **Node.js** ≥ 18
- **PostgreSQL** ≥ 14
- **npm** ≥ 9

### 1. Clone & Install
```bash
git clone https://github.com/AkashLavudya/BizOptics.git
cd BizOptics
npm install
```

### 2. Configure Environment

Copy the example file and fill in your values:
```bash
cp .env.example apps/server/.env
```

Minimum required values in `apps/server/.env`:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bizoptics
JWT_SECRET=your-secret-min-32-characters-here
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
```

Frontend (`apps/web/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup
```bash
# Create the database (PostgreSQL must be running)
createdb bizoptics

# Run Prisma migrations
npm run prisma:migrate

# Generate Prisma client
npm run prisma:generate

# Seed demo data (creates 3 demo users)
npm run prisma:seed
```

### 4. Start Development Servers

**Option A — Both at once:**
```bash
npm run dev
```

**Option B — Individually:**
```bash
# Terminal 1 — Backend (port 3001)
cd apps/server && npm run start:dev

# Terminal 2 — Frontend (port 3000)
cd apps/web && npm run dev
```

### 5. Open in Browser

| URL | Description |
|-----|-------------|
| http://localhost:3000 | Application |
| http://localhost:3001/api/docs | Swagger API Explorer |

---

## 🔑 Demo Credentials (after seed)

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@bizoptics.com | Admin@123! |
| **Analyst** | analyst@bizoptics.com | Analyst@123! |
| **User** | user@bizoptics.com | User@123! |

---

## 🐳 Docker (Full Stack)

```bash
# Start PostgreSQL + backend + frontend
docker-compose up -d

# Run migrations and seed inside container
docker-compose exec server npx prisma migrate dev
docker-compose exec server npx prisma db seed
```

---

## 📁 Project Structure

```
BizOptics/
├── apps/
│   ├── server/                   # NestJS Backend (port 3001)
│   │   ├── src/
│   │   │   ├── auth/             # JWT auth: register, login, refresh, reset-password
│   │   │   ├── business/         # Business CRUD + opportunity scoring
│   │   │   ├── search/           # Google Places search + scan history
│   │   │   ├── analysis/         # Website, automation & AI signal analysis
│   │   │   ├── recommendation/   # AI-generated action plans
│   │   │   ├── analytics/        # Dashboard KPIs, trends & top opportunities
│   │   │   ├── export/           # CSV, Excel, PDF export
│   │   │   ├── profile/          # User profile management
│   │   │   ├── admin/            # Admin panel + audit logs
│   │   │   ├── mail/             # Email templates (Nodemailer)
│   │   │   └── prisma/           # Database service
│   │   └── prisma/
│   │       ├── schema.prisma     # Full database schema
│   │       └── seed.ts           # Demo data seeder
│   └── web/                      # Next.js Frontend (port 3000)
│       └── src/
│           ├── app/
│           │   ├── (auth)/       # Login, Register, Forgot Password
│           │   └── (dashboard)/  # All dashboard pages
│           ├── components/
│           │   ├── ui/           # Reusable UI components
│           │   └── landing/      # Homepage sections
│           ├── lib/              # API client, axios interceptors
│           └── store/            # Zustand auth store
├── packages/
│   └── shared/                   # Shared TypeScript types & utilities
├── docker/                       # Dockerfile configs
├── docker-compose.yml
├── render.yaml                   # Render deployment blueprint
├── .env.example                  # All environment variables documented
├── DEPLOYMENT.md                 # Full production deployment guide
└── package.json                  # Monorepo root (npm workspaces)
```

---

## 🌐 Dashboard Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with hero, features & pricing |
| `/login` | Authentication |
| `/register` | New account creation |
| `/dashboard` | KPI overview cards |
| `/businesses` | Business list with filters & bulk export |
| `/businesses/:id` | Business detail with score rings & signals |
| `/search` | Country → State → City scan + history |
| `/analytics` | Recharts insights & trends |
| `/recommendations` | Action plans with status tracking |
| `/export` | Multi-format data export |
| `/settings` | Profile & password management |
| `/admin` | User management & audit logs |

---

## 🔑 API Endpoints

| Module | Key Endpoints |
|--------|--------------|
| **Auth** | `POST /api/v1/auth/register` · `/login` · `/logout` · `/refresh` · `/forgot-password` · `/reset-password` |
| **Business** | `GET/DELETE /api/v1/businesses` · `GET /businesses/:id` · `POST /businesses/:id/analyze` |
| **Search** | `POST /api/v1/search` · `GET /search/history` · `DELETE /search/history/:id` |
| **Analysis** | `POST /api/v1/analysis/business/:id` · `GET /analysis/:id` · `POST /analysis/batch` |
| **Recommendations** | `GET /api/v1/recommendations/:id` · `PATCH /recommendations/:id/action` |
| **Analytics** | `GET /api/v1/analytics` · `/stats` · `/trends` · `/top-opportunities` |
| **Export** | `POST /api/v1/export` · `GET /export/csv` · `/excel` · `/pdf` |
| **Profile** | `GET/PUT /api/v1/profile` · `PATCH /profile/change-password` |
| **Admin** | `GET /api/v1/admin/stats` · `/users` · `/audit-logs` |

---

## 🇮🇳 India Coverage

All **28 states** and **8 union territories** are supported with major cities:

**States:** Andhra Pradesh · Arunachal Pradesh · Assam · Bihar · Chhattisgarh · Goa · Gujarat · Haryana · Himachal Pradesh · Jharkhand · Karnataka · Kerala · Madhya Pradesh · Maharashtra · Manipur · Meghalaya · Mizoram · Nagaland · Odisha · Punjab · Rajasthan · Sikkim · Tamil Nadu · Telangana · Tripura · Uttar Pradesh · Uttarakhand · West Bengal

**Union Territories:** Andaman & Nicobar Islands · Chandigarh · Dadra & Nagar Haveli · Delhi · Jammu & Kashmir · Ladakh · Lakshadweep · Puducherry

---

## 🔒 Security

- Passwords hashed with **bcrypt** (12 rounds)
- **JWT** access tokens (8h) + refresh tokens (30d)
- **Rate limiting** via NestJS Throttler
- **CORS** restricted to configured origins
- `.env` files excluded from version control via `.gitignore`

---

## 📄 License

MIT © 2024 BizOptics

---

## 🙋 Support

For deployment help, see [DEPLOYMENT.md](./DEPLOYMENT.md).
