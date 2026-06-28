# Deployment Guide

## Architecture

```
Vercel (frontend) ──► Render (backend) ──► Neon (PostgreSQL)
```

## Prerequisites

- GitHub account with repo pushed
- [Neon](https://neon.tech) account (PostgreSQL)
- [Render](https://render.com) account (backend hosting)
- [Vercel](https://vercel.com) account (frontend hosting)

---

## 1. Database — Neon

1. Create a new project in Neon
2. Copy the connection string (PSL):
   ```
   postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/school_mgmt?sslmode=require
   ```
3. Note: Neon's free tier auto-suspends after inactivity (cold start). Use a cron job (e.g., cron-job.org) to ping every 10 min.

### Safe Migration Strategy

**Never modify an existing migration file after it has been deployed.** Flyway checksums will fail and the app won't start.

- **Schema change?** → Create a new file: `V{next_number}__description.sql`
- **Need to fix data?** → Create a new migration with `UPDATE`/`DELETE` statements
- **Accidentally ran a bad migration?** → Do NOT delete it. Create a new migration to undo it:

```sql
-- V16__undo_bad_change.sql
ALTER TABLE ... DROP COLUMN ...;
```

**Only drop the database schema in development.** On production, if you must reset:

```sql
-- This deletes ALL data — only as last resort
DROP SCHEMA public CASCADE; CREATE SCHEMA public;
```

Then re-deploy — Flyway will re-run all migrations.

---

## 2. Backend — Render

### Dockerfile

Already exists at `backend/Dockerfile` — multi-stage build:
1. `gradle:8.10-jdk21` builds the JAR
2. `eclipse-temurin:21-jre-alpine` runs it

### Environment Variables

Set these in Render dashboard (Web Service → Environment):

| Variable | Value |
|---|---|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://...neon.tech/school_mgmt?sslmode=require` |
| `SPRING_DATASOURCE_USERNAME` | Neon DB username |
| `SPRING_DATASOURCE_PASSWORD` | Neon DB password |
| `JWT_SECRET` | A long random string (min 256-bit / 32 chars) |
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `MAIL_HOST` | SMTP host (optional) |
| `MAIL_USERNAME` | SMTP username (optional) |
| `MAIL_PASSWORD` | SMTP password (optional) |

The `application-prod.properties` file uses `${SPRING_DATASOURCE_URL}` etc. — Render substitutes these at runtime.

### Deploy Steps

1. Push to GitHub (`git push origin main`)
2. Render auto-deploys if "Auto-Deploy" is enabled, or click "Manual Deploy" → "Deploy latest commit"

### Cold Start

Render free tier spins down after inactivity. First request takes 30-60s. To keep it warm:

- Set up a cron job at [cron-job.org](https://cron-job.org) pinging `https://your-app.onrender.com/actuator/health` every 10 minutes
- Or upgrade to Render Starter ($7/mo) for no spin-down

---

## 3. Frontend — Vercel

### Environment Variables

Set in Vercel project Settings → Environment Variables:

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://your-render-app.onrender.com/api` |

This tells the Axios instance where the backend lives. In development, it falls back to `/api` (Vite proxy → localhost:8080).

### Build Settings

Vercel auto-detects Vite. The build command is `npm run build` and output is `dist/`.

### Deploy Steps

1. Push to GitHub — Vercel auto-deploys from the linked repo
2. Or trigger a manual deploy from Vercel dashboard

### SPA Routing

Vercel handles client-side routing automatically for Vite projects. No `vercel.json` needed.

---

## 4. When You Make Code Changes

### Backend changes (Java, SQL, Gradle)

1. Make changes locally, test with `./gradlew bootRun`
2. Commit and push: `git push origin main`
3. Render auto-deploys (or manual deploy)

**If you added a new Flyway migration** → Render will apply it automatically on startup. No DB reset needed.

**If you modified an existing migration** (e.g., V11) → Render deploy will fail with checksum error. Fix:

- Option A (dev only): Drop the DB schema on Neon → redeploy (all data lost)
- Option B (production): Create a new migration (V16) that applies the change without modifying V11

### Frontend changes (React, TypeScript, MUI)

1. Test locally with `npm run dev`
2. Commit and push → Vercel auto-deploys

### Environment variable changes

- Changed backend URL? Update `VITE_API_URL` in Vercel → redeploy
- Changed DB password? Update `SPRING_DATASOURCE_PASSWORD` in Render → redeploy

---

## 5. Production vs Local Configuration

### Backend
| Setting | Local (application.yml) | Production (Render env vars) |
|---|---|---|
| DB URL | `jdbc:postgresql://localhost:5432/school_mgmt` | `SPRING_DATASOURCE_URL` |
| DB user | `school_admin` | `SPRING_DATASOURCE_USERNAME` |
| DB pass | `changeme` | `SPRING_DATASOURCE_PASSWORD` |
| JWT secret | `defaultSecretKey...` | `JWT_SECRET` |

### Frontend
| Setting | Local (dev) | Production (Vercel) |
|---|---|---|
| API URL | `/api` (Vite proxy → localhost:8080) | `VITE_API_URL` → Render backend |

---

## 6. Troubleshooting

### "Registration failed" — email may be in use
- Old sample data exists in DB. Reset Neon: run `DROP SCHEMA public CASCADE; CREATE SCHEMA public;` in Neon SQL Editor, then redeploy Render.

### 404 on API calls from frontend
- Frontend is calling itself (Vercel URL) instead of Render. Check `VITE_API_URL` is set correctly in Vercel env vars.

### Backend fails to start — Flyway checksum error
- An existing migration was modified. See "Safe Migration Strategy" above.

### Class dropdown empty on registration page
- The `/api/classes` endpoint requires auth. Make sure `SecurityConfig` has `/api/classes` in `permitAll()`.
