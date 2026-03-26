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

Name it following the convention: `<service-name>-<description>`
e.g. `s2-capacity-planning`

---

### 2. Choose a service name

Pick a short unique identifier (e.g. `s2`, `hr`, `finance`).
This becomes the URL path: `https://kloudiusms.bounceme.net/<name>`

---

### 3. Update the TODOs

| File | What to change |
|------|----------------|
| `.github/workflows/ci.yml` | `SERVICE_NAME` env var |
| `docker-compose.example.yml` | Service name (e.g. `s2`) |
| `Dockerfile` | Replace with your stack |

---

### 4. Set up GitHub environment

Go to repo **Settings → Environments → New environment** → name it `production`.

Add the following:

| Type | Name | Value |
|------|------|-------|
| Secret | `DEPLOY_TOKEN` | Fine-grained PAT (Contents: read+write on `multiservice_process_dashboard`) |

Also add at **Settings → Variables → Actions** (repo level):

| Name | Value |
|------|-------|
| `DEPLOY_ENV` | `production` |

---

### 5. Register the service on the dashboard

1. Go to `https://kloudiusms.bounceme.net/settings`
2. Click **Register Service** and fill in your service details
3. Click **Activate** — this triggers auto-deploy

---

### 6. Push to main

CI will build your image, push to GHCR, and trigger the platform deploy automatically.

---

## Local Development

```bash
cp .env.example .env
cp docker-compose.example.yml docker-compose.yml
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

**Calling the Microsoft Graph API (org users):**

The gateway proxies Graph requests. Pass the M365 access token via the `Authorization` header:

```ts
const response = await fetch('/api/graph/users', {
  headers: { Authorization: `Bearer ${accessToken}` }
});
```

The access token is obtained from MSAL in the dashboard and can be passed to your service via props or context if needed.

**Calling your own API:**

All requests go through the gateway at your service's path prefix:

```ts
const GATEWAY = import.meta.env.VITE_API_GATEWAY_URL || window.location.origin;
const BASE = `${GATEWAY}/<your-prefix>`;  // e.g. /s2

const data = await fetch(`${BASE}/items`).then(r => r.json());
```

The gateway strips the prefix before forwarding — your API receives `/items`, not `/s2/items`.

---

## Requirements for Your Service

Your container must:
- Listen on `PORT` (env var, default `3000`)
- Connect to Postgres using `DB_*` env vars (injected by the platform)
- Use `DB_SCHEMA` as the Postgres search path (for schema isolation)
- Serve `public/index.html` or your own frontend at `/`
