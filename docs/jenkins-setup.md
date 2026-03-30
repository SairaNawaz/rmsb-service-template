# Jenkins Setup (Service)

## Prerequisites

- Jenkins is running on the dashboard VM (see dashboard repo `docs/jenkins-setup.md`)
- The `github-token` credential already exists in Jenkins
- The dashboard Jenkins job has **Trigger builds remotely** enabled with token `rmsb-deploy-token`

## 1. Add Jenkins credentials

In Jenkins → **Manage Jenkins → Security → Credentials → Global → Add Credential**:

| Kind | ID | Value |
|------|----|-------|
| Username with password | `jenkins-admin` | Username: your Jenkins admin username, Password: your Jenkins admin API token |

To get your Jenkins API token: Jenkins → top-right user menu → **Configure** → **Add new Token** → copy it.

## 2. Set pipeline environment variables

Open the `Jenkinsfile` at the root of your repo and set `SERVICE_NAME` and `VITE_BASE_PATH` in the `environment` block:

```groovy
environment {
    REGISTRY       = 'ghcr.io'
    SERVICE_NAME   = 's2'   // ← your assigned service ID
    VITE_BASE_PATH = '/s2'  // ← your assigned path prefix
}
```

> `GHCR_OWNER`, `DASHBOARD_JENKINS_URL`, and `DASHBOARD_JOB` are **global** Jenkins env vars — set once in **Manage Jenkins → System → Global properties → Environment variables**. Do not add them per-job.

## 3. Create Jenkins pipeline job

1. **New Item** → name it after your service (e.g. `s2-service`) → **Pipeline** → OK
2. Under **Build Triggers** → check **GitHub hook trigger for GITScm polling**
3. Under **Pipeline** → `Pipeline script from SCM` → Git → your repo URL → branch `*/main` → Script Path: `Jenkinsfile`
4. Save

## 4. Add GitHub webhook

Go to your service repo **Settings → Webhooks → Add webhook**:

| Field | Value |
|-------|-------|
| Payload URL | `https://your-dashboard-domain/jenkins/github-webhook/` |
| Content type | `application/json` |
| Events | Just the push event |

## 5. Push to main

Jenkins builds the image, pushes to GHCR, then triggers the dashboard Jenkins job to deploy.
