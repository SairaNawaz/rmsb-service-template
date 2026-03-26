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

### 2. Set up GitHub environment

Go to repo **Settings → Environments → New environment** → name it `production`.

Add the following secret:

| Type | Name | Value |
|------|------|-------|
| Secret | `DEPLOY_TOKEN` | Fine-grained PAT (Contents: read+write on `multiservice_process_dashboard`) |

Add the following at **Settings → Variables → Actions** (repo level):

| Name | Value |
|------|-------|
| `DEPLOY_ENV` | `production` |

---

### 3. Register the service on the dashboard

1. Go to `https://kloudiusms.bounceme.net/settings`
2. Click **Register Service** — fill in Display Name, Icon, Description, and Repo URL
3. After submitting, a callout shows your assigned values:

| Value | Example | Where to use |
|-------|---------|--------------|
| **Service ID** | `s2` | `SERVICE_NAME` GitHub variable |
| **Path Prefix** | `/s2` | `VITE_BASE_PATH` GitHub variable, `DB_SCHEMA` |
| **Schema Name** | `schema_s2` | `DB_SCHEMA` in your `.env` |

---

### 4. Set GitHub environment variables

In the `production` environment (Settings → Environments → production), add:

| Type | Name | Value |
|------|------|-------|
| Variable | `SERVICE_NAME` | assigned Service ID (e.g. `s2`) |
| Variable | `VITE_BASE_PATH` | assigned Path Prefix (e.g. `/s2`) |

> These drive the CI image name and Vite base path — no workflow files need editing.

---

### 5. Update your Dockerfile

Replace the placeholder with your stack. If your service has a Vite frontend, wire up `VITE_BASE_PATH`:

```dockerfile
ARG VITE_BASE_PATH=/
ENV VITE_BASE_PATH=$VITE_BASE_PATH
RUN npm run build
```

And in `vite.config`:

```ts
base: process.env.VITE_BASE_PATH || '/',
```

---

### 6. Push to main

CI will build your image, push to GHCR, and trigger the platform deploy.

Then go back to the dashboard and click **Activate** on your service — this adds it to the compose and deploys it.

---

## Local Development

```bash
cp .env.example .env
# Fill in SERVICE_NAME, VITE_BASE_PATH, DB_SCHEMA from the dashboard callout
cp docker-compose.example.yml docker-compose.yml
# Rename the service key in docker-compose.yml to your assigned service ID
docker compose up --build
```

Open `http://localhost:3000` — you should see the health check page.

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

All requests go through the gateway at your service's path prefix:

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
