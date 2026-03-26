# Kloudius Service Template

A tech-agnostic starting point for building microservices on the Kloudius MultiService Process Dashboard. Includes CI/CD wiring, Docker config, and a health check page — bring your own stack.

---

## What's Included

| File | Purpose |
|------|---------|
| `.github/workflows/ci.yml` | Builds image, pushes to GHCR, triggers platform deploy |
| `Dockerfile` | Placeholder — replace with your own implementation |
| `docker-compose.example.yml` | Local dev setup (postgres + your service) |
| `.env.example` | Environment variables reference |
| `public/index.html` | Static health check page — confirms your service is reachable |

---

## Getting Started

### 1. Create a new repo from this template

GitHub → **Kloudius** org → **Use this template** → **Create a new repository**

---

### 2. Register your service on the dashboard

Go to `https://kloudiusms.bounceme.net/settings` → **Register Service**.

Fill in Display Name, Icon, Description, and the repo URL from step 1. After submitting, a callout shows your assigned values — **copy these before proceeding**:

| Value | Example | Used for |
|-------|---------|----------|
| **Service ID** | `s2` | `SERVICE_NAME` GitHub variable, image name |
| **Path Prefix** | `/s2` | `VITE_BASE_PATH` GitHub variable |
| **Schema Name** | `schema_s2` | `DB_SCHEMA` in your `.env` |

> The service starts as **pending** — you activate it after your first successful push.

---

### 3. Set up GitHub environment

Go to repo **Settings → Environments → New environment** → name it `production`.

Add the following:

| Type | Name | Value |
|------|------|-------|
| Secret | `DEPLOY_TOKEN` | Fine-grained PAT (Contents: read+write on `multiservice_process_dashboard`) |
| Variable | `SERVICE_NAME` | Service ID from step 2 (e.g. `s2`) |
| Variable | `VITE_BASE_PATH` | Path Prefix from step 2 (e.g. `/s2`) |

Also add at **Settings → Variables → Actions** (repo level):

| Name | Value |
|------|-------|
| `DEPLOY_ENV` | `production` |

> No workflow files need editing — CI reads everything from these variables.

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
# Rename the service key in docker-compose.yml to your assigned service ID
docker compose up --build
```

---

### 5. Push to main

CI will build your image, push to GHCR, and trigger the platform deploy.

---

### 6. Activate on the dashboard

Go back to `https://kloudiusms.bounceme.net/settings`, find your service and click **Activate**. This adds it to the platform compose and deploys your container.

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

## Shared Authentication (M365)

The dashboard handles M365 login — your service does not need its own auth.

**How it works:**

1. User logs in via the dashboard (Microsoft 365 / MSAL)
2. The dashboard writes the session to `localStorage` under the key `rmsb_user`:
   ```json
   {
     "username": "saira.nawaz@kloudius.com",
     "displayName": "Saira Nawaz",
     "role": "Administrator",
     "email": "saira.nawaz@kloudius.com"
   }
   ```
3. Your service frontend reads this directly — no redirect, no separate login

**Reading the session in your frontend:**

```ts
const stored = localStorage.getItem('rmsb_user');
const user = stored ? JSON.parse(stored) : null;

if (!user) {
  // user is not logged in — redirect or show message
}
```

**Calling your own API:**

```ts
const GATEWAY = import.meta.env.VITE_API_GATEWAY_URL || window.location.origin;
const BASE = `${GATEWAY}${import.meta.env.VITE_BASE_PATH}`;  // e.g. /s2

const data = await fetch(`${BASE}/items`).then(r => r.json());
```

The gateway strips the prefix before forwarding — your API receives `/items`, not `/s2/items`.

**Calling the Microsoft Graph API (org users):**

```ts
const response = await fetch('/api/graph/users', {
  headers: { Authorization: `Bearer ${accessToken}` }
});
```

---

## Requirements for Your Service

Your container must:
- Listen on `PORT` (env var, default `3000`)
- Connect to Postgres using `DB_*` env vars (injected by the platform)
- Use `DB_SCHEMA` as the Postgres search path (for schema isolation)
- Serve `public/index.html` or your own frontend at `/`
