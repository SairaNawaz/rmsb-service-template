# RMSB Service Template

A starting point for building microservices on the RMSB Platform. Includes shared auth, sidebar navigation, org user management, and auto-deploy to the platform.

---

## What's Included

- **Node.js / Express** API with PostgreSQL (schema-isolated per service)
- **React + TypeScript + Vite** frontend
- **Shared auth** — reads session from dashboard localStorage, no separate login needed
- **Sidebar layout** with Users page (Microsoft Graph org users + platform roles)
- **Multi-stage Dockerfile** — builds frontend and serves it from the API container
- **CI/CD** — builds image, pushes to GHCR, triggers rmsb-dashboard deploy automatically

---

## Getting Started

### 1. Create a new repo from this template

On GitHub, click **Use this template** → **Create a new repository**.

Name it following the convention: `rmsb-<service-name>-<description>`
e.g. `rmsb-s2-capacity-planning`

---

### 2. Choose a service name and path prefix

Pick a short unique identifier for your service (e.g. `s2`, `hr`, `finance`).
This becomes the URL path: `https://kloudiusms.bounceme.net/<name>`

---

### 3. Update the TODOs

Search for `TODO` across the repo — there are 7 places to update:

| File | What to change |
|------|---------------|
| `.github/workflows/ci.yml` | `SERVICE_NAME` and `VITE_SERVICE_BASE` |
| `Dockerfile` | `VITE_SERVICE_BASE` build arg default |
| `src/index.js` | `SERVICE_NAME`, mount your API routes |
| `src/routes/items.js` | Rename and replace with your routes |
| `src/db/migrate.js` | Replace example table with your tables |
| `frontend/src/components/Layout.tsx` | `SERVICE_DISPLAY_NAME` and `SERVICE_ICON` |
| `frontend/src/main.tsx` | `VITE_SERVICE_BASE` default value |
| `frontend/src/App.tsx` | Add your page imports and routes |
| `frontend/src/pages/Home.tsx` | Replace with your main page |

---

### 4. Add GitHub secret

Add `DEPLOY_PAT` to your new repo's secrets:

1. GitHub → repo **Settings** → **Secrets and variables** → **Actions** → **New repository secret**
2. Name: `DEPLOY_PAT`
3. Value: the same fine-grained PAT used by other service repos (Contents: read+write on `rmsb-dashboard`)

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

### 6. Push to main

Push your code — CI will build the image, push to GHCR, and trigger the platform deploy automatically.

---

## Local Development

```bash
# Copy env file
cp .env.example .env

# Install dependencies
npm install
cd frontend && npm install && cd ..

# Start postgres (from rmsb-dashboard directory)
docker compose up postgres -d

# Run API and frontend together
npm run dev          # API on :3001
cd frontend && npm run dev   # Frontend on :5174
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
rmsb-service-template/
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
├── Dockerfile             # Production: builds frontend + API in one image
├── .env.example
└── .github/
    └── workflows/
        └── ci.yml         # Build + push + trigger dashboard deploy
```
