# Kloudius MultiService Process Dashboard — Service Template

A starting point for building microservices on the Kloudius MultiService Process Dashboard. Includes shared auth, sidebar navigation, org user management, and auto-deploy to the platform.

---

## What's Included

- **Node.js / Express** API with PostgreSQL (schema-isolated per service)
- **React + TypeScript + Vite** frontend
- **Shared auth** — reads session from dashboard localStorage, no separate login needed
- **Sidebar layout** with Users page (Microsoft Graph org users + platform roles)
- **Multi-stage Dockerfile** — builds frontend and serves it from the API container
- **CI/CD** — builds image, pushes to GHCR, triggers platform deploy automatically

---

## Getting Started

### 1. Create a new repo from this template

On GitHub → **Kloudius** org → click **Use this template** → **Create a new repository**.

Name it following the convention: `<service-name>-<description>`
e.g. `s2-capacity-planning`

---

### 2. Choose a service name and path prefix

Pick a short unique identifier for your service (e.g. `s2`, `hr`, `finance`).
This becomes the URL path: `https://kloudiusms.bounceme.net/<name>`

---

### 3. Update the TODOs

Search for `TODO` across the repo — there are 6 places to update:

| File | What to change |
|------|---------------|
| `.github/workflows/ci.yml` | `SERVICE_NAME` env var + replace `workflow_dispatch` with `push` trigger |
| `frontend/vite.config.ts` | `base` path to match your service prefix (e.g. `'/s2'`) |
| `docker-compose.yml` | Service name (e.g. `s2`) |
| `src/index.js` | `SERVICE_NAME`, mount your API routes |
| `src/routes/items.js` | Rename and replace with your routes |
| `src/db/migrate.js` | Replace example table with your tables |
| `frontend/src/components/Layout.tsx` | `SERVICE_DISPLAY_NAME` and `SERVICE_ICON` |
| `frontend/src/App.tsx` | Add your page imports and routes |
| `frontend/src/pages/Home.tsx` | Replace with your main page |

---

### 4. Add GitHub secret

Add `DEPLOY_PAT` to your new repo's secrets:

1. GitHub → repo **Settings** → **Secrets and variables** → **Actions** → **New repository secret**
2. Name: `DEPLOY_PAT`
3. Value: the same fine-grained PAT used by other service repos (Contents: read+write on `Kloudius/multiservice_process_dashboard`)

---

### 5. Register the service on the dashboard

1. Go to `https://kloudiusms.bounceme.net/settings`
2. Click **Register Service** and fill in:
   - **Service ID**: your service name (e.g. `s2`)
   - **Display Name**: human-readable name (e.g. `Capacity Planning`)
   - **Port**: the port your container runs on (e.g. `3002`)
   - Other fields are auto-filled from the Service ID
3. Click **Activate** on the new service
4. Click **Sync Compose** — this regenerates `docker-compose.yml` and triggers auto-deploy

---

### 6. Enable CI and push to main

The workflow trigger is set to `workflow_dispatch` (manual) by default to prevent the template from running CI on itself. Before pushing, switch it to auto:

In `.github/workflows/ci.yml`, replace:
```yaml
on:
  workflow_dispatch:
```
With:
```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
```

Then push — CI will build the image, push to GHCR, and trigger the platform deploy automatically.

---

## Local Development

```bash
# Copy env and docker-compose files
cp .env.example .env
cp docker-compose.example.yml docker-compose.yml

# Install dependencies
npm install
cd frontend && npm install && cd ..

# Start everything (postgres + API + frontend)
docker compose up --build

# Or run without Docker
npm run dev        # API + frontend together
npm run dev:api    # API only on :3000
npm run dev:ui     # Frontend only on :5174
```

---

## Architecture

```
Browser → nginx → gateway (/api/*) → registry / users / graph
                         ↓
                  service prefix (/s2/*) → this service container
                         ↓
                  everything else → dashboard frontend
```

- The gateway strips the path prefix before forwarding to your container
  - `/s2/items` → your Express app receives `/items`
- Your container serves both the API and the built frontend static files
- Auth session is shared from the dashboard via `localStorage`

---

## File Structure

```
your-service/
├── src/
│   ├── index.js           # Express app entry point
│   ├── routes/
│   │   └── items.js       # Example routes — replace with yours
│   └── db/
│       ├── client.js      # PostgreSQL pool
│       └── migrate.js     # Table migrations
├── frontend/
│   ├── src/
│   │   ├── App.tsx        # Routes
│   │   ├── main.tsx       # BrowserRouter with basename
│   │   ├── components/
│   │   │   └── Layout.tsx # Sidebar shell
│   │   ├── hooks/
│   │   │   └── useAuth.ts # Read session from localStorage
│   │   └── pages/
│   │       ├── Home.tsx   # Replace with your main page
│   │       └── Users.tsx  # Org users + platform roles (ready to use)
│   ├── vite.config.ts
│   └── Dockerfile         # Dev server (local only)
├── Dockerfile                    # Production: builds frontend + API in one image
├── docker-compose.example.yml    # Copy to docker-compose.yml for local dev
├── .env.example
└── .github/
    └── workflows/
        └── ci.yml         # Build + push + trigger dashboard deploy
```
