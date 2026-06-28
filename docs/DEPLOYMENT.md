# AI Guardian — Deployment Guide

> Deploy the AI Guardian platform to production using Vercel (frontend) and Render or Railway (backend).

---

## Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- PostgreSQL 14+ (managed instance recommended)
- Git

---

## Frontend Deployment (Vercel)

### 1. Connect Repository

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"New Project"** → **Import Git Repository**
3. Select your AI Guardian repository
4. Set the **Root Directory** to `frontend`

### 2. Configure Build Settings

| Setting | Value |
|---------|-------|
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

### 3. Set Environment Variables

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://your-backend-url.onrender.com` |

### 4. Deploy

Click **"Deploy"**. Vercel will build and deploy automatically on every push to `main`.

### Custom Domain (Optional)

1. Go to **Settings → Domains**
2. Add your custom domain
3. Update DNS records as instructed

---

## Backend Deployment (Render)

### 1. Create New Web Service

1. Go to [render.com](https://render.com) and sign in
2. Click **"New"** → **"Web Service"**
3. Connect your repository
4. Set the **Root Directory** to `backend`

### 2. Configure Build Settings

| Setting | Value |
|---------|-------|
| Runtime | Docker |
| Dockerfile Path | `./Dockerfile` |
| Health Check Path | `/health` |

### 3. Add PostgreSQL Database

1. Click **"New"** → **"PostgreSQL"**
2. Create a managed PostgreSQL instance
3. Copy the **Internal Database URL**

### 4. Set Environment Variables

| Variable | Value | Required |
|----------|-------|----------|
| `DATABASE_URL` | `postgresql+psycopg://...` (from step 3) | ✅ |
| `SECRET_KEY` | Generate: `python -c "import secrets; print(secrets.token_urlsafe(64))"` | ✅ |
| `CORS_ORIGINS` | `https://your-app.vercel.app` | ✅ |
| `GROQ_API_KEY` | Your Groq API key | Optional |
| `GROQ_BASE_URL` | `https://api.groq.com/openai/v1` | Optional |
| `HINDSIGHT_API_KEY` | Your Hindsight API key | Optional |
| `HINDSIGHT_BANK_ID` | `ai-guardian-audits` | Optional |

### 5. Deploy

Click **"Create Web Service"**. Render builds and deploys from the Dockerfile.

---

## Backend Deployment (Railway — Alternative)

### 1. Create Project

1. Go to [railway.app](https://railway.app) and sign in
2. Click **"New Project"** → **"Deploy from GitHub"**
3. Select your repository

### 2. Add PostgreSQL

1. Click **"New"** → **"Database"** → **"PostgreSQL"**
2. Railway automatically sets `DATABASE_URL`

### 3. Configure

- Set **Root Directory** to `backend`
- Set **Start Command** to `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Add environment variables (same as Render table above)

### 4. Deploy

Railway deploys automatically on push.

---

## Docker Compose (Self-Hosted)

For self-hosted deployments, use the included `docker-compose.yml`:

```bash
# Create production .env
cp backend/.env.example backend/.env
# Edit .env with production values

# Start services
docker compose up -d

# The API will be available at http://localhost:8000
```

### Production Checklist

Before going to production, ensure:

- [ ] **SECRET_KEY** is a long, random, unique value
- [ ] **CORS_ORIGINS** is restricted to your frontend domain only
- [ ] **DATABASE_URL** points to a managed PostgreSQL instance with backups
- [ ] **TLS/HTTPS** is terminated at the platform edge (Render/Railway handle this)
- [ ] **Rate limiting** is configured (built-in: 120 req/min per IP)
- [ ] **File upload limit** is enforced (built-in: 10 MB)
- [ ] **Security headers** are sent (built-in: X-Content-Type-Options, X-Frame-Options, Referrer-Policy)

---

## Environment Variables Reference

### Backend

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `sqlite:///./ai_guardian.db` | Database connection string. Use PostgreSQL in production. |
| `SECRET_KEY` | `development-only-change-me` | JWT signing secret. **Must be changed in production.** |
| `GROQ_API_KEY` | _(empty)_ | Enables live LLM inference via Groq. Without it, deterministic explanations are used. |
| `GROQ_BASE_URL` | `https://api.groq.com/openai/v1` | OpenAI-compatible API base URL. |
| `HINDSIGHT_API_KEY` | _(empty)_ | Enables Hindsight Cloud memory. Without it, local keyword-based retrieval is used. |
| `HINDSIGHT_BANK_ID` | `ai-guardian-audits` | Dedicated memory bank for audit storage. |
| `CORS_ORIGINS` | `http://localhost:5173` | Comma-separated list of allowed frontend origins. |

### Frontend

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:8000` | Backend API base URL. |

---

## Monitoring

### Health Check

```bash
curl https://your-backend-url/health
```

Expected response:
```json
{
  "status": "healthy",
  "memory": "hindsight",
  "routing": "cascadeflow"
}
```

### Logs

- **Render**: Dashboard → Logs tab
- **Railway**: Dashboard → Deployments → Logs
- **Docker**: `docker compose logs -f api`

---

## Scaling

| Component | Strategy |
|-----------|----------|
| Frontend | Vercel auto-scales globally via CDN |
| Backend | Scale Render/Railway instances horizontally |
| Database | Use managed PostgreSQL with read replicas |
| Memory | Hindsight Cloud handles scaling |
