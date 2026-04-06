# Service Template

Starting point for building a service on the MultiService Process Dashboard.

---

## Setup

### 1. Create a repo from this template

GitHub → **Use this template** → **Create a new repository**

---

### 2. Register on the dashboard

Go to `/settings` → **Register Service** → fill in display name, icon, description, repo URL, and your env vars.

After submitting, copy `.env.example` to `.env` and fill in your assigned values:

```bash
SERVICE_NAME=s2        # Service ID from callout
VITE_BASE_PATH=/s2     # Path Prefix from callout
DB_SCHEMA=schema_s2    # Schema Name from callout
GHCR_OWNER=kloudius    # your GitHub org/username
```

Both compose files reference these vars — no manual replacements needed in YAML.

---

### 4. Configure CI

Set these in your Jenkins job → Build Environment:

| Variable | Value |
|----------|-------|
| `SERVICE_NAME` | your Service ID |
| `VITE_BASE_PATH` | your Path Prefix |
| `DASHBOARD_REPO` | `<org>/rmsb-dashboard` |

Credentials required: `github-token`, `jenkins-admin`

---

### 5. Local dev

```bash
cp .env.example .env
# fill in values
docker compose up --build
```

---

### 6. Push to main

CI builds the image, commits `docker-compose.service.yml` to the dashboard repo, and triggers a dashboard deploy.

---

### 7. Activate on the dashboard

Go to `/settings` → find your service → click **Activate**.

---

## Files

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Local dev — postgres + your service |
| `docker-compose.service.yml` | Production — platform managed, fill in once then leave it |
| `Dockerfile` | Replace with your own stack if needed |
| `server.js` | Placeholder server with health + DB check page |
| `.env.example` | Environment variables reference |
| `Jenkinsfile` | CI pipeline — build, publish compose, trigger deploy |

---

## Requirements

Your container must:
- Listen on port `3000`
- Connect to Postgres via `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- Use `DB_SCHEMA` as the Postgres search path
- Serve something at `/` (health check)
