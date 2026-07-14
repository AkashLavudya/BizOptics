# Deployment Guide - Business Opportunity Intelligence Platform

This guide outlines how to deploy the monorepo to production. Since it is a monorepo consisting of a **Next.js frontend** and a **NestJS backend**, the recommended approach is:
1. **Frontend (`apps/web`):** Deploy to **Vercel**.
2. **Backend (`apps/server`):** Deploy to **Railway** or **Render**.
3. **Database:** Deploy to **Neon** (PostgreSQL) or any other hosted PostgreSQL provider.

---

## 1. Database Setup (Neon PostgreSQL)

1. Create a free database instance on [Neon](https://neon.tech/).
2. Copy the connection string. It will look like:
   `postgresql://neondb_owner:password@ep-xxxxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`

---

## 2. Backend Deployment (`apps/server`)

The backend requires a persistent environment to run Node.js/NestJS. **Railway** or **Render** are recommended.

### Option A: Railway (easiest)
1. Go to [Railway](https://railway.app/) and create a new project.
2. Select **Deploy from GitHub repo** and select your repository.
3. In the Railway service settings:
   - **Root Directory:** `apps/server`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm run start:prod`
4. Add the following **Environment Variables** in Railway:
   - `DATABASE_URL`: *[Your Neon connection string]*
   - `JWT_SECRET`: *[A secure 32-character string]*
   - `JWT_REFRESH_SECRET`: *[A secure 32-character string]*
   - `JWT_EXPIRES_IN`: `8h`
   - `JWT_REFRESH_EXPIRES_IN`: `30d`
   - `PORT`: `3001`
   - `NODE_ENV`: `production`
   - `API_PREFIX`: `api/v1`
   - `CORS_ORIGINS`: *[Your Vercel deployment URL, e.g., `https://your-app.vercel.app`]*
   - `GOOGLE_PLACES_API_KEY`: *[Your Google Places API Key]*
5. Railway will deploy and provide a public URL (e.g., `https://server-production-xxxx.up.railway.app`).

---

## 3. Frontend Deployment on Vercel (`apps/web`)

Vercel is optimized for Next.js. Follow these steps to set up the project:

### Step 1: Import Project to Vercel
1. Go to [Vercel](https://vercel.com/) and click **Add New** > **Project**.
2. Import your GitHub repository.

### Step 2: Configure Project Settings
In the configuration screen, adjust the following settings:

* **Framework Preset:** `Next.js`
* **Root Directory:** Keep it as the **root (`.`)** of the monorepo. Do NOT change it to `apps/web`. This ensures Vercel can access the shared workspace dependencies in `packages/shared`.
* **Build and Output Settings:**
  - Toggle **Build Command** to override and type:
    ```bash
    npm run build --workspace=packages/shared && npm run build --workspace=apps/web
    ```
  - Toggle **Output Directory** to override and type:
    ```
    apps/web/.next
    ```
  - Toggle **Install Command** to override and type:
    ```bash
    npm install
    ```

### Step 3: Add Environment Variables
Add the following key under the **Environment Variables** section:

* `NEXT_PUBLIC_API_URL`: `https://your-backend-url.up.railway.app/api/v1`
  *(Point this to the public URL provided by your backend deployment in Step 2)*

### Step 4: Click Deploy 🚀
Vercel will install the monorepo dependencies, build the shared package, build the Next.js app, and deploy the application.

---

## 4. Troubleshooting Build Errors

### 1. Prisma Client Missing / Schema Sync
If the frontend build fails saying it cannot find Prisma Client, ensure that the Prisma schema in the backend is generated first during deployment. If deploying the backend on Railway/Render:
- Add a custom build command: `npx prisma generate && npm run build`
- This ensures the Prisma files are compiled before the NestJS bundle is compiled.

### 2. CORS Issues
If you can log in but API requests fail with CORS errors, ensure your backend's `CORS_ORIGINS` environment variable matches your Vercel URL exactly (without a trailing slash), e.g.:
`CORS_ORIGINS=https://your-app.vercel.app`
