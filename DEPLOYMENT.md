# 🚀 BizOptics — Production Deployment Guide

This guide covers deploying the monorepo to production:

| Layer | Platform |
|-------|----------|
| **Frontend** (`apps/web`) | [Vercel](https://vercel.com) |
| **Backend** (`apps/server`) | [Render](https://render.com) or [Railway](https://railway.app) |
| **Database** | [Neon](https://neon.tech) (PostgreSQL, free tier) |

---

## Step 1 — Database on Neon

1. Sign up at [neon.tech](https://neon.tech) and create a new project named `bizoptics`.
2. From the dashboard, copy the **Connection String**. It will look like:
   ```
   postgresql://neondb_owner:xxxxxxxx@ep-cool-name-xxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```
3. Keep this for later — you'll add it as `DATABASE_URL` in both Render and Vercel.

---

## Step 2 — Backend on Render

### Option A: Blueprint (Automatic)
A `render.yaml` is included at the repository root. When you connect your GitHub repo on Render, it will auto-detect this file and pre-fill all settings.

1. Go to [dashboard.render.com](https://dashboard.render.com) → **New** → **Blueprint**.
2. Connect your GitHub repository.
3. Render will auto-configure using `render.yaml`. Fill in the secret values that say `# Replace`:
   - `DATABASE_URL` → your Neon connection string
   - `CORS_ORIGINS` → your Vercel deployment URL (add after Step 3)

### Option B: Manual Web Service
1. **New** → **Web Service** → Connect GitHub repo.
2. Configure:

   | Setting | Value |
   |---------|-------|
   | **Runtime** | Node |
   | **Root Directory** | *(leave empty — use repo root)* |
   | **Build Command** | `npm install && npx prisma generate --schema=apps/server/prisma/schema.prisma && npm run build --workspace=packages/shared && npm run build --workspace=apps/server` |
   | **Start Command** | `node apps/server/dist/src/main.js` |

3. Add **Environment Variables**:

   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `PORT` | `3001` |
   | `API_PREFIX` | `api/v1` |
   | `DATABASE_URL` | *(your Neon connection string)* |
   | `JWT_SECRET` | *(generate: `openssl rand -hex 32`)* |
   | `JWT_REFRESH_SECRET` | *(generate: `openssl rand -hex 32`)* |
   | `JWT_EXPIRES_IN` | `8h` |
   | `JWT_REFRESH_EXPIRES_IN` | `30d` |
   | `CORS_ORIGINS` | *(your Vercel URL, e.g. `https://bizoptics.vercel.app`)* |
   | `GOOGLE_PLACES_API_KEY` | *(optional — leave blank to use mock data)* |
   | `SMTP_HOST` | `smtp.gmail.com` |
   | `SMTP_PORT` | `587` |
   | `SMTP_USER` | *(your Gmail address)* |
   | `SMTP_PASS` | *(your Gmail App Password)* |
   | `SMTP_FROM` | `BizOptics <noreply@bizoptics.com>` |

4. Click **Create Web Service**. Render will build and deploy.
5. Copy your Render service URL (e.g., `https://bizoptics-backend-api.onrender.com`).

### Seed the Database (one-time)

After the first deployment succeeds, open the **Shell** tab in your Render service and run:
```bash
node -e "require('./apps/server/dist/src/prisma/prisma.service')" 2>/dev/null; \
  npx prisma migrate deploy --schema=apps/server/prisma/schema.prisma && \
  node apps/server/dist/src/prisma/seed.js
```

Or easier — in your local terminal with `DATABASE_URL` set to your Neon URL:
```bash
DATABASE_URL="<neon_url>" npx prisma migrate deploy --schema=apps/server/prisma/schema.prisma
DATABASE_URL="<neon_url>" npx ts-node apps/server/prisma/seed.ts
```

---

## Step 3 — Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New** → **Project**.
2. Import your GitHub repository.
3. **Configure Project Settings:**

   | Setting | Value |
   |---------|-------|
   | **Framework Preset** | `Next.js` |
   | **Root Directory** | `.` *(keep as repo root — do NOT change to `apps/web`)* |
   | **Build Command** (override) | `npm run build --workspace=packages/shared && npm run build --workspace=apps/web` |
   | **Output Directory** (override) | `apps/web/.next` |
   | **Install Command** (override) | `npm install` |

4. **Environment Variables:**

   | Key | Value |
   |-----|-------|
   | `NEXT_PUBLIC_API_URL` | `https://bizoptics-backend-api.onrender.com/api/v1` |
   | `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |
   | `NEXT_PUBLIC_APP_NAME` | `BizOptics` |

5. Click **Deploy** 🚀

---

## Step 4 — Update CORS After Both Are Live

Once both services are deployed, go back to **Render** → your backend service → **Environment** and update:

```
CORS_ORIGINS=https://your-app.vercel.app
```

Then click **Save** — Render will auto-redeploy.

---

## Troubleshooting

### ❌ Vercel: 404 NOT_FOUND on root
- Ensure **Root Directory** is `.` (the repo root), not `apps/web`.
- Ensure the **Output Directory** override is set to `apps/web/.next`.

### ❌ Vercel: Cannot find module 'packages/shared'
- The Build Command must build `packages/shared` **before** `apps/web`.
- Use: `npm run build --workspace=packages/shared && npm run build --workspace=apps/web`

### ❌ Render: `dist/src/main.js` not found
- The build order must be: `prisma generate` → `packages/shared build` → `apps/server build`.
- The start command must be `node apps/server/dist/src/main.js` (note: `dist/src/`, not `dist/`).

### ❌ CORS errors after login
- Your `CORS_ORIGINS` on Render must match your Vercel URL **exactly** — no trailing slash.
- Example: `CORS_ORIGINS=https://bizoptics.vercel.app`

### ❌ Prisma: Schema not found
- All Prisma commands must include `--schema=apps/server/prisma/schema.prisma` when run from the repo root.

### ❌ Render free tier sleeps after 15 minutes
- The backend will cold-start (~30 seconds) if idle. Upgrade to a paid plan or use a service like [UptimeRobot](https://uptimerobot.com) to ping `/api/v1/health` every 5 minutes.

---

## Environment Variables Reference

See [`.env.example`](./.env.example) for a full list of all variables with descriptions.
