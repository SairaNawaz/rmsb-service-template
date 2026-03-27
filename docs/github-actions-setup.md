# GitHub Actions Setup (Service)

## 1. Create GitHub environment

Go to repo **Settings → Environments → New environment** → name it `production`.

## 2. Add secrets and variables

| Type | Name | Value |
|------|------|-------|
| Secret | `DEPLOY_TOKEN` | Fine-grained PAT with **Contents: read+write** on `rmsb-dashboard` |
| Variable | `SERVICE_NAME` | Service ID from dashboard callout (e.g. `s2`) |
| Variable | `VITE_BASE_PATH` | Path prefix from dashboard callout (e.g. `/s2`) |
| Variable | `DASHBOARD_REPO` | `rmsb-dashboard` |

## 3. Add repo-level variable

Go to **Settings → Variables → Actions**:

| Name | Value |
|------|-------|
| `DEPLOY_ENV` | `production` |

## 4. Push to main

CI will build the image, push to GHCR, and dispatch `service-deploy` to the dashboard repo which triggers the deploy.
