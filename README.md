# Service Template

A tech-agnostic starting point for building microservices on the MultiService Process Dashboard. Includes CI/CD wiring (GitHub Actions + Jenkins), Docker config, and a health check page — bring your own stack.

---

## What's Included

| File | Purpose |
|------|---------|
| `.github/workflows/ci.yml` | GitHub Actions — builds image, pushes to GHCR, triggers dashboard deploy |
| `Jenkinsfile` | Jenkins — builds image, pushes to GHCR, triggers dashboard Jenkins pipeline |
| `Dockerfile` | Placeholder — replace with your own implementation |
| `docker-compose.example.yml` | Local dev setup (postgres + your service) |
| `.env.example` | Environment variables reference |
| `public/index.html` | Static health check page — confirms your service is reachable |

See [docs/switching-ci.md](docs/switching-ci.md) to choose between GitHub Actions and Jenkins.

---

## Getting Started

### 1. Create a new repo from this template

GitHub → **Use this template** → **Create a new repository**

---

### 2. Register your service on the dashboard

Go to your dashboard URL `/settings` → **Register Service**.

Fill in Display Name, Icon, Description, and the repo URL from step 1. After submitting, a callout shows your assigned values — **copy these before proceeding**:

| Value | Example | Used for |
|-------|---------|----------|
| **Service ID** | `s2` | `SERVICE_NAME` variable, image name |
| **Path Prefix** | `/s2` | `VITE_BASE_PATH` variable |
| **Schema Name** | `schema_s2` | `DB_SCHEMA` in your `.env` |

> The service starts as **pending** — you activate it after your first successful push.

---

### 3. Choose your CI system and configure it

**Option A — GitHub Actions:** See [docs/github-actions-setup.md](docs/github-actions-setup.md)

**Option B — Jenkins:** See [docs/jenkins-setup.md](docs/jenkins-setup.md)

---

### 4. Build your service

Replace `Dockerfile` with your stack. If your service has a Vite frontend, wire up `VITE_BASE_PATH` so assets are served correctly under the path prefix:

```dockerfile
ARG VITE_BASE_PATH=/
ENV VITE_BASE_PATH=$VITE_BASE_PATH
RUN npm run build
```

In `vite.config`:

```ts
base: process.env.VITE_BASE_PATH || '/',
build: {
  assetsDir: 'static',
},
```

Set up local dev:

```bash
cp .env.example .env
# Fill in SERVICE_NAME, VITE_BASE_PATH, DB_SCHEMA from the dashboard callout
cp docker-compose.example.yml docker-compose.yml
docker compose up --build
```

---

### 5. Push to main

CI builds your image, pushes to GHCR, and triggers the dashboard deploy.

---

### 6. Activate on the dashboard

Go back to your dashboard URL `/settings`, find your service and click **Activate**.

---

## Architecture

```
Browser → nginx → gateway (/api/*) → registry / users
                       ↓
              service prefix (/s2/*) → your container
                       ↓
              everything else → dashboard frontend
```

- The gateway strips the path prefix before forwarding to your container
- `/s2/items` → your app receives `/items`
- Auth session is shared from the dashboard via `localStorage`

---

## Shared Authentication

The dashboard handles login — your service does not need its own auth.

Read the session in your frontend:

```ts
const stored = localStorage.getItem('rmsb_user');
const user = stored ? JSON.parse(stored) : null;
// user: { username, displayName, role, email }
```

Call your own API through the gateway:

```ts
const GATEWAY = import.meta.env.VITE_API_GATEWAY_URL || window.location.origin;
const BASE = `${GATEWAY}${import.meta.env.VITE_BASE_PATH}`;

const data = await fetch(`${BASE}/items`).then(r => r.json());
```

---

## Requirements for Your Service

Your container must:
- Listen on `PORT` (env var, default `3000`)
- Connect to Postgres using `DB_*` env vars (injected by the platform)
- Use `DB_SCHEMA` as the Postgres search path (for schema isolation)
- Serve `public/index.html` or your own frontend at `/`
