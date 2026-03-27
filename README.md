# Service Template

A tech-agnostic starting point for building microservices on the MultiService Process Dashboard. Includes CI/CD wiring (GitHub Actions + Jenkins), Docker config, and a health + DB check page — bring your own stack.

---

## What's Included

| File | Purpose |
|------|---------|
| `Dockerfile` | Node.js server on port 3000 serving health + DB check page — replace with your stack |
| `server.js` | Minimal Express server; serves static files and `/db-check` endpoint |
| `package.json` | Dependencies for the placeholder server (`express`, `pg`) |
| `public/index.html` | Health check page with live DB connection test |
| `docker-compose.example.yml` | Local dev setup (postgres + your service) |
| `.env.example` | Environment variables reference |
| `.github/workflows/ci.yml` | GitHub Actions — builds image, pushes to GHCR, triggers dashboard deploy |
| `Jenkinsfile` | Jenkins — builds image, pushes to GHCR, triggers dashboard Jenkins pipeline |
| `docs/github-actions-setup.md` | GitHub Actions configuration guide |
| `docs/jenkins-setup.md` | Jenkins configuration guide |
| `docs/switching-ci.md` | How to toggle between GitHub Actions and Jenkins |

---

## Getting Started

### 1. Create a repo from this template

GitHub → **Use this template** → **Create a new repository**

---

### 2. Register your service on the dashboard

Go to your dashboard URL `/settings` → **Register Service** → fill in Display Name, Icon, Description, and your repo URL.

After submitting, a callout shows your assigned values:

| Value | Example | Used for |
|-------|---------|----------|
| **Service ID** | `s2` | `SERVICE_NAME` in CI, image name |
| **Path Prefix** | `/s2` | `VITE_BASE_PATH` in CI |
| **Schema Name** | `schema_s2` | `DB_SCHEMA` in `.env` |

The callout also shows exactly what to configure for **GitHub Actions** and **Jenkins** — copy those values before dismissing. You can reopen it anytime via the **Setup Info** button on the service row.

> The service starts as **pending** — you activate it after your first successful push.

---

### 3. Choose your CI system and configure it

**Option A — GitHub Actions:** [docs/github-actions-setup.md](docs/github-actions-setup.md)

**Option B — Jenkins:** [docs/jenkins-setup.md](docs/jenkins-setup.md)

See [docs/switching-ci.md](docs/switching-ci.md) to toggle between the two.

---

### 4. Set up local dev

```bash
cp .env.example .env
# Fill in SERVICE_NAME, VITE_BASE_PATH, DB_SCHEMA from the dashboard callout

cp docker-compose.example.yml docker-compose.yml
# Rename the service key in docker-compose.yml to your assigned service ID

docker compose up --build
```

---

### 5. Build your service

Replace `Dockerfile` with your own stack. Your container must:
- **Listen on port 3000** — the gateway routes to this port
- Connect to Postgres using `DB_*` env vars
- Serve your frontend at `/`

If your service has a **Vite frontend**, wire up `VITE_BASE_PATH`:

```dockerfile
ARG VITE_BASE_PATH=/
ENV VITE_BASE_PATH=$VITE_BASE_PATH
RUN npm run build
```

In `vite.config`:

```ts
base: process.env.VITE_BASE_PATH || '/',
build: { assetsDir: 'static' },
```

---

### 6. Push to main

CI builds your image, pushes to GHCR, and triggers the dashboard deploy.

---

### 7. Activate on the dashboard

Go to `/settings` → find your service → click **Activate**.

---

## Architecture

```
Browser → nginx → gateway (/api/*) → registry / users
                       ↓
              /s2/* → your container :3000 (prefix stripped)
                       ↓
              /*   → dashboard frontend
```

- Gateway strips the path prefix: `/s2/items` → your app receives `/items`
- Auth session shared from dashboard via `localStorage`
- Each service gets its own PostgreSQL schema

---

## Shared Authentication

The dashboard handles login — your service does not need its own auth.

Read the session in your frontend:

```ts
const stored = localStorage.getItem('rmsb_user');
const user = stored ? JSON.parse(stored) : null;
// { username, displayName, role, email }
```

Call your own API through the gateway:

```ts
const GATEWAY = import.meta.env.VITE_API_GATEWAY_URL || window.location.origin;
const BASE = `${GATEWAY}${import.meta.env.VITE_BASE_PATH}`; // e.g. /s2

const data = await fetch(`${BASE}/items`).then(r => r.json());
// Gateway strips prefix → your API receives /items
```

---

## Requirements for Your Service

| Requirement | Detail |
|-------------|--------|
| Port | Must listen on `3000` |
| Database | Connect via `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` |
| Schema | Use `DB_SCHEMA` as Postgres search path |
| Health check | Serve something at `/` |
