# Switching Between GitHub Actions and Jenkins

Both CI systems are available in this template.

| System | Config |
|--------|--------|
| GitHub Actions | `.github/workflows/ci.yml` |
| Jenkins | `Jenkinsfile` |

## Use GitHub Actions

1. **Settings → Actions → General** → Allow actions
2. Disable the Jenkins webhook (or don't add one)
3. Follow [github-actions-setup.md](github-actions-setup.md)

## Use Jenkins

1. **Settings → Actions → General** → Disable actions
2. Add Jenkins webhook in repo Settings
3. Follow [jenkins-setup.md](jenkins-setup.md)

## How each triggers the dashboard deploy

| System | Trigger method |
|--------|---------------|
| GitHub Actions | `repository_dispatch` → dashboard GitHub Actions |
| Jenkins | REST API call → dashboard Jenkins job |
