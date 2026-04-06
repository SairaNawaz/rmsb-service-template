# Service Template

Starting point for building a service on the Microservice Process Dashboard.

---
### 1. Create a repo from this template

GitHub → **Use this template** → **Create a new repository**

## Running Locally

### 2. Set your env vars

```bash
cp .env.example .env
```

Set your `SERVICE_NAME`, then follow the convention `{SERVICE_NAME}_user`, `{SERVICE_NAME}_pass`, `{SERVICE_NAME}_db` for local DB values:

```bash
SERVICE_NAME=s2

POSTGRES_USER=s2_user
POSTGRES_PASSWORD=s2_pass
POSTGRES_DB=s2_db

DB_HOST=postgres
DB_PORT=5432
DB_NAME=s2_db
DB_USER=s2_user
DB_PASSWORD=s2_pass
```

`DB_SCHEMA` is derived from `SERVICE_NAME` automatically — no need to set it.

> In production, `DB_USER` and `DB_PASSWORD` are auto-provisioned by the dashboard on activation — you do not set them there.

---

### 3. Start locally

```bash
docker compose up --build
```

Spins up a local postgres + your service. Health + DB check page available at `http://localhost:3000`.

---

## Deploying to Production

### 1. Register on the dashboard

Go to `/settings` → **Register Service** → fill in display name, icon, description, repo URL, and any service-specific env vars (not DB — those are auto-provisioned).

Note your assigned **Service ID** from the dashboard (e.g. `s2`).

---

### 2. Configure CI

Set `SERVICE_NAME` in the `environment` block in `Jenkinsfile`:

```groovy
environment {
    REGISTRY     = 'ghcr.io'
    SERVICE_NAME = 's2'   // ← your assigned Service ID
}
```

Credentials required: `github-token`, `jenkins-admin`

> `DASHBOARD_REPO`, `GHCR_OWNER`, `DASHBOARD_JENKINS_URL`, `DASHBOARD_JOB` are global Jenkins vars — set once by the admin.

---

### 3. Push to main

CI builds the image, commits `docker-compose.service.yml` to the dashboard repo, and triggers a dashboard deploy.

---

### 4. Activate on the dashboard

Go to `/settings` → find your service → click **Activate**.

DB schema and credentials are provisioned automatically on activation.

---

## Files

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Local dev — postgres + your service |
| `docker-compose.service.yml` | Production — platform managed, do not edit |
| `Dockerfile` | Replace with your own stack if needed |
| `server.js` | Placeholder server with health + DB check page |
| `.env.example` | Environment variables reference |
| `Jenkinsfile` | CI pipeline — build, publish compose, trigger deploy |

---

## Container Requirements

- Listen on port `3000`
- Connect to Postgres via `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- Use `DB_SCHEMA` as the Postgres search path
- Serve something at `/` (health check)
